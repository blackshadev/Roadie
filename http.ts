import { IncomingMessage, ServerResponse, Server as HttpServer, createServer as createHttpServer, STATUS_CODES } from "http"
import { Server as HttpsServer, createServer as createHttpsServer } from "https"
import { BufferReader } from "./BufferReader";
import { IDictionary } from "./collections";
import { errno, IError } from "./errno";
import { RouteMap, IRoutingResult } from "./routemap";
import { WebFunction } from "./endpoints";

export enum HttpVerb {
    "GET" = 0,
    "POST",
    "PUT",
    "DELETE",
    "UPGRADE",
    "TRACE",
    "HEAD",
    "OPTIONS",
    "UPDATE"
}

export function parseHttpVerb(verb: string) {
    let v: HttpVerb = HttpVerb[verb];
    if (typeof (HttpVerb.GET) !== typeof (v)) throw new Error("Invalid HttpVerb");
    return v;
}


class HttpRequest {
    get url(): string { return this.req.url; };
    get method(): string { return this.req.method; }
    get parameters(): IDictionary<string> { return this._parameters; };
    get ctx() { return this._ctx; }
    

    protected _parameters: IDictionary<string>;
    protected req: IncomingMessage;
    protected reader: BufferReader;
    protected _ctx: HttpContext;
    

    constructor(ctx: HttpContext, route: IRoutingResult, req: IncomingMessage) {
        this._ctx = ctx;
        this.req = req;
        this._parameters = route.params;
        this.reader = new BufferReader(parseInt(this.header("content-length")), req);
        
    }

    readBody(cb: (data: Buffer) => void): void {
        this.reader.read(cb);
    }

    header(headerName: string): string { return this.req.headers[headerName]; }

    parameter(paramName: string): string { return this._parameters[paramName]; }
}

class HttpResponse {

    protected resp: ServerResponse;
    protected statusCode: number = 200;
    protected headers: { [name: string]: string };

    private eos: boolean = false;
    protected _encoding: string = "utf8";
    protected _data: Buffer | string;
    protected _startTime: number;

    protected _ctx: HttpContext;
    get ctx() { return this._ctx; }

    constructor(ctx: HttpContext, resp: ServerResponse) {
        this._ctx = ctx;
        this.resp = resp;
        this.headers = {};
        this._startTime = Date.now();
    }

    status(code: number): void {
        this.statusCode = code;
    }

    set contentType(val: string) { this.headers["Content-Type"] = val; }
    header(headerName: string, value: string) : void {
        this.headers[headerName] = value;
    }

    data(dat: Buffer|string|Object): void {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
            this.header("Content-Type", "application/json");
        }

        this._data = <Buffer|string>dat;
    }

    append(dat: Buffer | string): void {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object")
            dat = JSON.stringify(dat);

        if (bin && this._data instanceof Buffer) Buffer.concat([<Buffer>this._data, <Buffer>dat]);
        else this._data += dat.toString();
    }

    send(): void {
        if (this.eos) return console.log("server", "Request already send");

        var len = typeof (this._data) === "string" ? Buffer.byteLength(<string>this._data, this._encoding) : this._data.length;
        this.headers["Content-Length"] = len + "";
        this.headers["Date"] = new Date().toUTCString();

        this.resp.writeHead(this.statusCode, this.headers);
        this.resp.end(this._data);
        this.eos = true;
        
        var t = Date.now() - this._startTime;
        console.log("server", " send: " + typeof (this._data) +
            " of length " + len + " bytes, took " + t + "ms");
    }

}

export interface IHttpError {
    extra?: string;
    text?: string;
    code: number;
}
export class HttpError implements IHttpError {

    extra: string;

    text: string;

    // HTTP statuscode
    code: number = 500;

    constructor(err: IHttpError | Error | number, errtxt?: string, extra?: string) {
        if (err instanceof HttpError) {
            this.code = err.code;
            this.text = err.text;
            this.extra = err.extra;
        } else if (err instanceof Error) {
            let errDescr: IError = HttpError.translateErrNo((<NodeJS.ErrnoException>err).errno);
            this.code = errDescr && errDescr.http ? errDescr.http : 500;
            this.text = errDescr ? errDescr.description : err.name;
            this.extra = err.toString();
        } else if (typeof (err) === "number") {
            this.code = <number>err;
            this.text = errtxt ? errtxt : HttpError.httpStatusText(this.code);
            if (extra) this.extra = extra;
        }
    }

    send(ctx: HttpContext) {
        ctx.response.status(this.code);
        ctx.response.data("<h1>" + this.code + " " + this.text + "</h1>");
        if (this.extra) ctx.response.append(this.extra);
        ctx.response.send();
    }

    static translateErrNo(no: number): IError { return errno[no]; };
    static httpStatusText(no: string|number): string {
        return STATUS_CODES[no];
    }
    
}

export class HttpContext {
    request: HttpRequest;
    response: HttpResponse;
    route: IRoutingResult;

    get url(): string { return this.request.url; } 
    get method(): string { return this.request.method; } 
    
    protected _server: RoadieServer;
    constructor(serv: RoadieServer, route: IRoutingResult,  req: IncomingMessage, resp: ServerResponse) {
        this._server = serv;
        this.route = route;
        this.request = new HttpRequest(this, route, req);
        this.response = new HttpResponse(this, resp);
    }

    execute(): void {
        if (this.route.resource)
            this.route.resource.execute(this);
        else
            this.error(404);
    }

    error(err: IHttpError | Error | number, errtxt?: string, extra?: string): void {
        let error = new HttpError(err, errtxt, extra);

        if (this._server.onError) this._server.onError(error, this);
        else error.send(this);
    }

    cwd(): string { return this._server.cwd; }
}

type ErrorHandle = (err: HttpError, ctx: HttpContext) => void;
interface IRoadieServerParameters {
    port?: number;
    host?: string
    root?: string;
    webserviceDir?: string;
    tlsOptions?: {}
    // User definable error handler
    onError?: (err: HttpError, ctx: HttpContext) => void
}

export interface IRoutes {
    [route: string]: WebFunction | string;
}

export class RoadieServer {
    protected _port: number = 80;
    get port(): number { return this._port; };

    protected _host: string;
    get host(): string { return this._host; };

    get cwd(): string { return this.rootDir; }

    get useHttps(): boolean { return !!this.tlsOptions; }

    protected rootDir: string = process.cwd();
    protected webserviceDir: string = "webservices";
    protected tlsOptions: {};
    protected server: HttpsServer | HttpServer;
    protected routemap: RouteMap;

    constructor(oPar: IRoadieServerParameters) {
        this._port = oPar.port || this._port;
        this._host = oPar.host || this._host;
        this.webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this.rootDir = oPar.root || this.rootDir;
        this.routemap = new RouteMap();

        this.tlsOptions = oPar.tlsOptions;

        this.server = this.createServer();
    }
    
    protected createServer(): HttpsServer | HttpServer {
        const _h = (req: IncomingMessage, resp: ServerResponse) => {
            let verb = parseHttpVerb(req.method);
            let route = this.getRoute(req.url, verb);
            
            let ctx = new HttpContext(this, route, req, resp);
            ctx.execute();
        };
        
        if (this.useHttps)
            return createHttpsServer(this.tlsOptions, _h);
        else
            return createHttpServer(_h)   
    }
    
    onError: ErrorHandle;
    

    start(): void {
        this.server.listen(this._port, this._host);
        console.log("listening on port " + this._host + ":" + this._port);
    }

    getRoute(url: string, verb: HttpVerb) : IRoutingResult {
        return this.routemap.getRoute(url, verb);
    }

    addRoute(route: string, endpoint: WebFunction | string, data?: any) {
        this.routemap.addRoute(route, endpoint, data);
    }

    addRoutes(routes: IRoutes) : void {
        for (var k in routes) 
            this.addRoute(k, routes[k]);
    }
    
}
