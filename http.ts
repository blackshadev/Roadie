import {
    createServer as createHttpServer,
    IncomingMessage, Server as HttpServer,
    ServerResponse, STATUS_CODES,
} from "http";
import { createServer as createHttpsServer, Server as HttpsServer } from "https";
import { Socket } from "net";
import { TlsOptions } from "tls";
import { parse as urlParse, Url as IURL } from "url";
import { BufferReader } from "./BufferReader";
import { IDictionary } from "./collections";
import { Endpoint, IWebServiceClass, WebFunction, WebMethodEndpoint } from "./endpoints";
import { errno, IError } from "./errno";
import { IRoutingResult, RouteMap } from "./routemap";

interface IInputRoutes { [route: string]: string | WebFunction  };

export enum HttpVerb {
    "GET" = 0,
    "POST",
    "PUT",
    "DELETE",
    "UPGRADE",
    "TRACE",
    "HEAD",
    "OPTIONS",
    "UPDATE",
}

export function parseHttpVerb(verb: string): HttpVerb {
    let v: HttpVerb = HttpVerb[verb];
    if (typeof (HttpVerb.GET) !== typeof (v)) {
        throw new Error("Invalid HttpVerb");
    }
    return v;
}

export class HttpRequest {
    get url(): string { return this._req.url; };
    get method(): string { return this._req.method; }
    get parameters(): IDictionary<string> { return this._parameters; };
    get ctx(): HttpContext { return this._ctx; }
    get uri(): string { return this._uri; }
    get queryParams(): IDictionary<string> { return this._queryParameters; };
    get request(): IncomingMessage { return this._req; }

    protected _parameters: IDictionary<string>;
    protected _req: IncomingMessage;
    protected _reader: BufferReader;
    protected _ctx: HttpContext;
    protected _uri: string;

    protected _queryString: string;
    protected _queryParameters: IDictionary<string>;

    constructor(ctx: HttpContext, route: IRoutingResult, req: IncomingMessage) {
        this._ctx = ctx;
        this._req = req;
        this._parameters = route.params;
        this._uri = route.uri;
        this._reader = new BufferReader(parseInt(this.header("content-length"), 10), req);

        this.parseUrl();
    }

    public readBody(cb: (data: Buffer) => void): void {
        this._reader.read(cb);
    }

    public header(headerName: string): string { return this._req.headers[headerName]; }

    public queryParameter(paramName: string): string { return this._queryParameters[paramName]; }

    public parameter(paramName: string): string { return this._parameters[paramName]; }

    private parseUrl(): void {
        const oPar: IURL = urlParse(this._req.url, true);
        this._queryString = oPar.search;
        this._queryParameters = oPar.query;
    }

}

export class HttpResponse {
    get response(): ServerResponse { return this._resp; }
    set contentType(val: string) { this.headers["Content-Type"] = val; }

    protected _resp: ServerResponse;
    protected statusCode: number = 200;
    protected headers: { [name: string]: string };

    protected _encoding: string = "utf8";
    protected _data: Buffer | string;
    protected _startTime: number;
    protected _ctx: HttpContext;

    private eos: boolean = false;
    get ctx(): HttpContext { return this._ctx; }

    constructor(ctx: HttpContext, resp: ServerResponse) {
        this._ctx = ctx;
        this._resp = resp;
        this.headers = {};
        this._startTime = Date.now();
    }

    public status(code: number): void {
        this.statusCode = code;
    }

    public header(headerName: string, value: string): void {
        this.headers[headerName] = value;
    }

    public data(dat: Buffer|string|Object): void {
        let bin: boolean = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
            this.header("Content-Type", "application/json");
        }

        this._data = <Buffer|string> dat;
    }

    public append(dat: Buffer | string): void {
        let bin: boolean = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
        }

        if (bin && this._data instanceof Buffer) {
            Buffer.concat([<Buffer> this._data, <Buffer> dat]);
        } else {
            this._data += dat.toString();
        }
    }

    public send(): void {
        if (this.eos) {
            return this._ctx.server.log("server", "Request already send");
        }

        let len: number = typeof (this._data) === "string" ?
            Buffer.byteLength(<string> this._data, this._encoding) :
            this._data.length;
        this.headers["Content-Length"] = len + "";
        this.headers.Date = new Date().toUTCString();

        this._resp.writeHead(this.statusCode, this.headers);
        this._resp.end(this._data);

        this.eos = true;

        let t: number = Date.now() - this._startTime;
        this._ctx.server.log("server", " send: " + typeof (this._data) +
            " of length " + len + " bytes, took " + t + "ms");
    }

}

export interface IHttpError {
    extra?: string;
    text?: string;
    statuscode: number;
}
export class HttpError implements IHttpError {
    public static translateErrNo(no: number): IError { return errno[no]; };
    public static httpStatusText(no: string|number): string {
        return STATUS_CODES[no];
    }

    public extra: string;
    public text: string;
    // HTTP statuscode
    public statuscode: number = 500;

    constructor(err: IHttpError | Error | number | any, errtxt?: string, extra?: string) {
        if (err.statuscode !== undefined) {
            this.statuscode = err.statuscode;
            this.text = err.text || err.message;
            this.extra = err.extra;
        } else if (err instanceof Error) {
            let errDescr: IError = HttpError.translateErrNo((<NodeJS.ErrnoException> err).errno);
            this.statuscode = errDescr && errDescr.http ? errDescr.http : 500;
            this.text = errDescr ? errDescr.description : err.name;
            this.extra = err.toString();
        } else if (typeof (err) === "number") {
            this.statuscode = <number> err;
            this.text = errtxt ? errtxt : HttpError.httpStatusText(this.statuscode);
            if (extra) {
                this.extra = extra;
            }
        }
    }

    public send(ctx: HttpContext) {
        ctx.response.status(this.statuscode);
        ctx.response.data("<h1>" + this.statuscode + " " + this.text + "</h1>");
        if (this.extra) {
            ctx.response.append(this.extra);
        }
        ctx.response.send();
    }

}

export class HttpContext {
    public request: HttpRequest;
    public response: HttpResponse;
    public readonly route: IRoutingResult;

    get userData() { return this._server.userData; }
    get url(): string { return this.request.url; }
    get method(): string { return this.request.method; }
    get server(): RoadieServer { return this._server; }

    protected _server: RoadieServer;
    constructor(serv: RoadieServer, route: IRoutingResult,  req: IncomingMessage, resp: ServerResponse) {
        this._server = serv;
        this.route = route;
        this.request = new HttpRequest(this, route, req);
        this.response = new HttpResponse(this, resp);
    }

    public execute(): void {
        if (this.route.resource) {
            this.route.resource.execute(this);
        } else {
            this.error(404);
        }
    }

    public error(err: IHttpError | Error | number, errtxt?: string, extra?: string): void {
        let error = new HttpError(err, errtxt, extra);

        if (this._server.onError) {
            this._server.onError(error, this);
        } else {
            error.send(this);
        }
    }

    public cwd(): string { return this._server.cwd; }

}

export type ErrorHandle = (err: HttpError, ctx: HttpContext) => void;
export interface IRoadieServerParameters {
    port?: number;
    host?: string;
    root?: string;
    webserviceDir?: string;
    tlsOptions?: TlsOptions;
    // User definable error handler
    onError?: (err: HttpError, ctx: HttpContext) => void;
    verbose?: boolean;
    // includes hostname in routes
    includeHostname?: boolean;
    userData?: any;
}

export interface IRoutes {
    [route: string]: WebFunction | string;
}

export type WebMethodDecorator = (target: any, method: string, descr: TypedPropertyDescriptor<Function>) => void;

export interface IWebMethodParams {
    data?: {};
    server?: RoadieServer;
}

export function WebMethod(route: string, oPar?: IWebMethodParams): WebMethodDecorator {
    oPar = oPar || {};
    oPar.server = oPar.server || RoadieServer.default;

    return function (this: any, target: any, method: string, descr: TypedPropertyDescriptor<Function>) {
        if (typeof (descr.value) !== "function") {
            throw new Error(`Given WebMethod ${method} is not a function`);
        }

        const endpoint = new WebMethodEndpoint(target.constructor, method, oPar.data);
        oPar.server.addRoute(route, endpoint);
    };
}

export class RoadieServer {
    public static default: RoadieServer;

    get port(): number { return this._port; };

    get host(): string { return this._host; };

    get cwd(): string { return this._rootDir; }

    get webserviceDir(): string { return this._rootDir + "/" + this._webserviceDir; }

    get useHttps(): boolean { return !!this._tlsOptions; }

    get userData() { return this._userData; }

    public onError: ErrorHandle;

    protected _port: number = 80;
    protected _host: string;
    protected _userData: any;

    protected _rootDir: string = process.cwd();
    protected _webserviceDir: string = "webservices";
    protected _tlsOptions: {};
    protected _server: HttpsServer | HttpServer;
    protected _routemap: RouteMap;
    protected _verbose: boolean;
    protected _includeHostname: boolean;

    private _connections: { [remoteAddrPort: string]: Socket };

    constructor(oPar: IRoadieServerParameters) {
        this._connections = {};

        this._port = oPar.port !== undefined ? oPar.port : oPar.tlsOptions !== undefined ? 443 : 80;
        this._host = oPar.host || this._host;
        this._webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this._rootDir = oPar.root || this._rootDir;
        this._verbose = !!oPar.verbose;
        this._routemap = new RouteMap();
        this._userData = oPar.userData;
        this._includeHostname = !!oPar.includeHostname;

        if (!this._verbose) {
            this.log = () => { /* NOOP */ };
        }

        this._tlsOptions = oPar.tlsOptions;

        this._server = this.createServer();
    }

    /**
     * Uses the routemap of the given server.
     * @remark Adding routes to one of the servers will affect both servers. The routemap is shared.
     * @param serv Server to share the routes with
     */
    public useRoutes(serv: RoadieServer): void {
        this._routemap = serv._routemap;
    }

    /**
     * Starts accepting external connection
     */
    public async start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._server.listen(this._port, this._host, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Stops the service and destroys all connections
     */
    public async stop(): Promise<void> {
        return new Promise<void>(
            (resolve, reject) => {

                (<any> this._server).close(
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    },
                );

                for (let key in this._connections) {
                    if (this._connections.hasOwnProperty(key)) {
                        this._connections[key].destroy();
                    }
                }
            },
        );

    }

    /**
     * Gets a route of bound to a specific URL
     * @param url URL to parse
     * @param verb Verb used
     */
    public getRoute(url: string, verb: HttpVerb): IRoutingResult {
        return this._routemap.getRoute(url, verb);
    }

    /**
     * Includes a webservice file by requireing it relative to the root and webservice dir
     * @param svcFile File name (without extension) in the webservice dir
     * @param isAbsolute whenever or not the given filename is an absolute path or a relative file name
     */
    public include(svcFile: string, isAbsolute?: boolean) {
        require(!isAbsolute ? (this.webserviceDir + "/" + svcFile + ".js") : svcFile );
    }

    /**
     * Adds a route to the Roadie server
     * @param route Route to add
     * @param endpoint Endpoint to bind the route to
     * @param data Optional UserData to bind on the route
     */
    public addRoute(
        route: string,
        endpoint: IWebServiceClass | WebFunction | string | Endpoint<any, any>,
        data?: any,
    ): void {
        const endp = endpoint instanceof Endpoint ?
            <Endpoint<any, any>> endpoint :
            Endpoint.Create(<WebFunction | string> endpoint, data);

        this._routemap.addRoute(route, endp);
    }

    public log(...args: string[]): void {
        console.log.apply(console, args);
    }

    public addRoutes(routes: any): void {
        if (routes instanceof Array) {
            for (let route of routes) {
                this.addRoutes(route);
            }
            return;
        }

        if (typeof (routes) === "string") {
            routes = require(`${this._rootDir}/${routes}`);
        }

        if (typeof (routes) !== "object") {
            throw new Error("Invalid route argument given");
        }

        for (let k in routes as IRoutes) {
            if (routes.hasOwnProperty(k)) {
                this.addRoute(k, (<IRoutes> routes)[k]);
            }
        }
    }

    /**
     * Tracks connections
     * @source https://github.com/isaacs/server-destroy
     * @param sock Socket to track
     */
    protected addConnection(sock: Socket) {
        let key = sock.remoteAddress + ":" + sock.remotePort;
        this._connections[key] = sock;
        sock.on("close", () => delete this._connections[key]);
    }

    protected createServer(): HttpsServer | HttpServer {
        const _h = (req: IncomingMessage, resp: ServerResponse) => {
            const verb = parseHttpVerb(req.method);
            const url = this._includeHostname ? (req.headers.host + req.url) : req.url;
            const route = this.getRoute(url, verb);

            const ctx = new HttpContext(this, route, req, resp);
            ctx.execute();
        };

        let serv: HttpServer | HttpsServer;
        if (this.useHttps) {
            serv = createHttpsServer(this._tlsOptions, _h);
        } else {
            serv = createHttpServer(_h);
        }

        serv.on("connection", (s) => this.addConnection(s));

        return serv;
    }

}
