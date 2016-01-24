import { HttpVerb, HttpContext, RoadieServer } from "./http";

import { Map, constructorOf } from "./collections";
import { WebService } from "./webservice";


export type WebFunction = ((ctx: HttpContext) => void);
export interface WebServiceClass {
    new (ctx: HttpContext, method: string): WebService
}

export class Endpoints extends Map<HttpVerb, Endpoint<any, any>> { }

export abstract class Endpoint<T, K> {
    script: T;
    data: K;

    constructor(script: T, data: K) {
        this.script = script;
        this.data = data;
    }

    static Create<T>(script: string | WebFunction, data?: T): Endpoint<any, T> {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint<T>(<WebFunction>script, data);
            case "string": return new ScriptEndpoint<T>(<string>script, data);            
        }
        throw new Error("Unknown endpoint type");
    }

    abstract execute(ctx: HttpContext): void;
    
}

export class WebMethodEndpoint<K> extends Endpoint<WebServiceClass, K> {
    method: string;

    constructor(cls: WebServiceClass, method: string, data?: K) {
        super(cls, data);
        this.method = method;
    }

    execute(ctx: HttpContext): void {
        let svc = new this.script(ctx, this.method);
        if (svc.isReady) svc[this.method]();
    }
}

export class ScriptEndpoint<K> extends Endpoint<string, K> {
    fileName: string;
    method: string;

    protected _class: WebServiceClass;
    protected _server: RoadieServer;
    constructor(script: string, data?: K) {
        let parts = script.split(":");
        this.fileName = parts[0];
        this.method = parts[1];
        
        super(script, data);
    }

    execute(ctx: HttpContext): void {
        if (!this._class)
            this._class = require(ctx.server.webserviceDir + "/" + this.fileName);

        let svc = new this._class(ctx, this.method);
        if (svc.isReady) svc[this.method]();
    }

}


export class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    

    execute(ctx: HttpContext): void { this.script(ctx); }

}