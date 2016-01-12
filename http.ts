import { IncomingMessage, ServerResponse, Server as HttpServer, createServer as createHttpServer } from "http"
import { Server as HttpsServer, createServer as createHttpsServer } from "https"

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
        switch (this.readState) {
            case ReadingState.read:
                cb(this._data);
                break;
            case ReadingState.empty:
                this.readState = ReadingState.reading;
                let len = parseInt(this.header("content-length"));
                this._data_len = isNaN(len) ? 0 : len;
                this._data = new Buffer(this._data_len);
                this._data_iX = 0;
                this.req.on("data", (chk: Buffer) => {
                    let len = Math.min(this._data_len - this._data_iX, chk.length);
                    chk.copy(this._data, this._data_iX, 0, len);
                    this._data_iX += len;
                    this.req.on("end", () => this.readState = ReadingState.read);
                });
                // fall through
            case ReadingState.reading:
                this.req.on("end", () => cb(this._data));
                break;
        }

    };

    protected req: IncomingMessage;

    constructor(req: IncomingMessage) {
        this.req = req;
        this.readBody((data: Buffer) => {
            console.log(data);
        });
    }
}

class HttpResponse {

    protected resp: ServerResponse;

    constructor(resp: ServerResponse) {
        this.resp = resp;
    }

}

export class HttpContext {
    request: HttpRequest;
    response: HttpResponse;

    constructor(req: IncomingMessage, resp: ServerResponse) {
        this.request = new HttpRequest(req);
        this.response = new HttpResponse(resp);
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