
export class Endpoint<T, K> {
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
        return;
    }
}

export class ScriptEndpoint<K> extends Endpoint<string, K> {

}

export type WebFunction = ((ctx: any) => void);

export class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {

}