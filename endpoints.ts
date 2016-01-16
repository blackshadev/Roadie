import { HttpVerb, HttpContext } from "./http";
import { Map, constructorOf } from "./collections";
import { WebService } from "./webservice";


export type WebFunction = ((ctx: HttpContext) => void);

export class Endpoints extends Map<HttpVerb, Endpoint<any, any>> { }

export abstract class Endpoint<T, K> {
    script: T;
    data: K;

    constructor(script: T, data: K) {
        this.script = script;
        this.data = data;
    }

    static Create<T>(script: string | WebFunction, data: T): Endpoint<any, T> {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint<T>(<WebFunction>script, data);
            case "string": return new ScriptEndpoint<T>(<string>script, data);
        }
        throw new Error("Unknown endpoint type");
    }

    abstract execute(ctx: HttpContext): void;
    
}

export class ScriptEndpoint<K> extends Endpoint<constructorOf<WebService>, K> {
    fileName: string;
    method: string;


    constructor(script: string, data: K) {
        let parts = script.split(":");
        this.fileName = parts[0];
        this.method = parts[1];

        let svc: constructorOf<WebService> = require(this.fileName);
        super(svc, data);

        
    }

    execute(ctx: HttpContext): void {
        
    }

}



export class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    

    execute(ctx: HttpContext): void { this.script(ctx); }

}