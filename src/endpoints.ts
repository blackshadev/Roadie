import { constructorOf, Map } from "./collections";
import { HttpContext, HttpVerb, RoadieServer } from "./http";
import { WebService } from "./webservice";

export type WebFunction = (ctx: HttpContext, userData?: any) => void;

export interface IWebServiceClass {
    new (ctx: HttpContext, method: string): WebService;
}

export class Endpoints extends Map<HttpVerb, Endpoint<any, any>> { }

export abstract class Endpoint<T, K> {
    public static Create<T>(script: string | WebFunction, data?: T): Endpoint<any, T> {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint<T>(script as WebFunction, data);
            case "string": return new ScriptEndpoint<T>(script as string, data);
            default: throw new Error("Unknown endpoint type");
        }
    }

    public readonly script: T;
    public readonly data: K;

    constructor(script: T, data: K) {
        this.script = script;
        this.data = data;
    }

    public abstract execute(ctx: HttpContext): Promise<void>;

}

export class WebMethodEndpoint<K> extends Endpoint<IWebServiceClass, K> {
    public readonly method: string;

    constructor(cls: IWebServiceClass, method: string, data?: K) {
        super(cls, data);
        this.method = method;
    }

    public async execute(ctx: HttpContext): Promise<void> {
        const svc = new this.script(ctx, this.method);
        if (svc.isReady) {
            return svc._execute_(this.method);
        }
    }
}

export class ScriptEndpoint<K> extends Endpoint<string, K> {
    public readonly fileName: string;
    public readonly method: string;

    protected _class: IWebServiceClass;
    protected _server: RoadieServer;
    constructor(script: string, data?: K) {
        const parts = script.split(":");

        super(script, data);

        this.fileName = parts[0];
        this.method = parts[1];
    }

    public async execute(ctx: HttpContext): Promise<void> {
        if (!this._class) {
            this._class = require(ctx.server.webserviceDir + "/" + this.fileName);
        }

        const svc = new this._class(ctx, this.method);
        if (svc.isReady) {
            return svc._execute_(this.method);
        }
    }

}

export class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    public async execute(ctx: HttpContext): Promise<void> {
        return this.script(ctx, this.data);
    }
}
