import { HttpContext } from "./http"; 

export type WebFunction = ((ctx: HttpContext) => void);

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

export class ScriptEndpoint<K> extends Endpoint<string, K> {

    execute(ctx: HttpContext): void {

    }

}



export class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    

    execute(ctx: HttpContext): void { this.script(ctx); }

}