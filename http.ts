import { IncomingMessage, ServerResponse, Server as HttpServer, createServer as createHttpServer, STATUS_CODES } from "http"
import { Server as HttpsServer, createServer as createHttpsServer } from "https"
import { BufferReader } from "./BufferReader";

import { errno, IError } from "./errno";

export enum ReadingState {
    empty,
    reading,
    read,
    closed
}

class HttpRequest {

    get url(): string { return this.req.url; };
    get method(): string { return this.req.method; }

    header(headerName: string): string { return this.req.headers[headerName]; };

    private _data_len: number;
    private _data_iX: number;
    private _data: Buffer;
    protected readState: ReadingState = ReadingState.empty;
    readBody(cb: (data: Buffer) => void): void {
        this.reader.read(cb);
    };

    protected req: IncomingMessage;
    protected reader: BufferReader;

    constructor(req: IncomingMessage) {
        this.req = req;
        this.reader = new BufferReader(parseInt(this.header("content-length")), req);
        
    }
}

class HttpResponse {

    protected resp: ServerResponse;
    protected statusCode: number = 200;
    protected headers: { [name: string]: string };

    private eos: boolean = false;
    protected _encoding: string = "utf8";
    protected _data: Buffer | string;
    protected _startTime: number;

    constructor(resp: ServerResponse) {
        this.resp = resp;
        this.headers = {};
        this._startTime = Date.now();
    }

    status(code: number): void {
        this.statusCode = code;
    }

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


export class HttpError {
    static translateErrNo(no: string): IError { return errno[no]; };
    static httpStatusText(no: string): string {
        return STATUS_CODES[no];
    }

}

export class HttpContext {
    request: HttpRequest;
    response: HttpResponse;

    get url(): string { return this.request.url; } 
    get method(): string { return this.request.method; } 


    constructor(req: IncomingMessage, resp: ServerResponse) {
        this.request = new HttpRequest(req);
        this.response = new HttpResponse(resp);

        setTimeout(() => {
            this.response.data({
                testVal: true,
                more: { less:true }
            });
            this.response.send();

        })

    }
}


interface IRoadieServerParameters {
    port?: number;
    host?: string
    root?: string;
    webserviceDir?: string;
    tlsOptions?: {}
}

export class RoadieServer {
    protected _port: number = 80;
    get port(): number { return this._port; };

    protected _host: string;
    get host(): string { return this._host; };


    get useHttps(): boolean { return !!this.tlsOptions; }

    protected rootDir: string = process.cwd();
    protected webserviceDir: string = "webservices";
    protected tlsOptions: {};
    protected server: HttpsServer | HttpServer;
    

    constructor(oPar: IRoadieServerParameters) {
        this._port = oPar.port || this._port;
        this._host = oPar.host || this._host;
        this.webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this.rootDir = oPar.root || this.rootDir;

        this.tlsOptions = oPar.tlsOptions;

        this.server = this.createServer();
    }



    protected createServer(): HttpsServer | HttpServer {
        const _h = (req: IncomingMessage, resp: ServerResponse) => {
            let ctx = new HttpContext(req, resp);
        };
        
        if (this.useHttps)
            return createHttpsServer(this.tlsOptions, _h);
        else
            return createHttpServer(_h)
        
    }

    start(): void {
        this.server.listen(this._port, this._host);
        console.log("listening on port " + this._host + ":" + this._port);
    }

    


}