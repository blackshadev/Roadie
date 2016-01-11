import { IncomingMessage, ServerResponse, Server as HttpServer, createServer as createHttpServer } from "http"
import { Server as HttpsServer, createServer as createHttpsServer } from "https"


declare interface HttpRequest {
    url: string;
    method: string;
    header(headerName: string): string;
    readBody(cb: (data: Buffer) => void): void;
}

declare interface HttpResponse {

}

export interface HttpContext {
    request: HttpRequest;
    response: HttpResponse;
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

    

    constructor(oPar: IRoadieServerParameters) {
        this._port = oPar.port || this._port;
        this._host = oPar.host || this._host;
        this.webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this.rootDir = oPar.root || this.rootDir;

        this.tlsOptions = oPar.tlsOptions;


    }



    protected server(): HttpsServer | HttpServer {
        const _h = (req: IncomingMessage, resp: ServerResponse) => {

        };

        return this.useHttps ? createHttpServer(_h) : createHttpsServer(this.tlsOptions, _h);
    }



}