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
            console.log(req, resp);
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