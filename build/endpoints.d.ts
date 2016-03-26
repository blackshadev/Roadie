import { HttpVerb, HttpContext, RoadieServer } from "./http";
import { Map } from "./collections";
import { WebService } from "./webservice";
export declare type WebFunction = ((ctx: HttpContext) => void);
export interface WebServiceClass {
    new (ctx: HttpContext, method: string): WebService;
}
export declare class Endpoints extends Map<HttpVerb, Endpoint<any, any>> {
}
export declare abstract class Endpoint<T, K> {
    script: T;
    data: K;
    constructor(script: T, data: K);
    static Create<T>(script: string | WebFunction, data?: T): Endpoint<any, T>;
    abstract execute(ctx: HttpContext): void;
}
export declare class WebMethodEndpoint<K> extends Endpoint<WebServiceClass, K> {
    method: string;
    constructor(cls: WebServiceClass, method: string, data?: K);
    execute(ctx: HttpContext): void;
}
export declare class ScriptEndpoint<K> extends Endpoint<string, K> {
    fileName: string;
    method: string;
    protected _class: WebServiceClass;
    protected _server: RoadieServer;
    constructor(script: string, data?: K);
    execute(ctx: HttpContext): void;
}
export declare class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    execute(ctx: HttpContext): void;
}
