import { HttpContext, HttpVerb, RoadieServer } from "./http";
import { Map } from "./collections";
import { WebService } from "./webservice";
export declare type WebFunction = (ctx: HttpContext, userData?: any) => void;
export interface IWebServiceClass {
    new (ctx: HttpContext, method: string): WebService;
}
export declare class Endpoints extends Map<HttpVerb, Endpoint<any, any>> {
}
export declare abstract class Endpoint<T, K> {
    static Create<T>(script: string | WebFunction, data?: T): Endpoint<any, T>;
    readonly script: T;
    readonly data: K;
    constructor(script: T, data: K);
    abstract execute(ctx: HttpContext): Promise<void>;
}
export declare class WebMethodEndpoint<K> extends Endpoint<IWebServiceClass, K> {
    readonly method: string;
    constructor(cls: IWebServiceClass, method: string, data?: K);
    execute(ctx: HttpContext): Promise<void>;
}
export declare class ScriptEndpoint<K> extends Endpoint<string, K> {
    readonly fileName: string;
    readonly method: string;
    protected _class: IWebServiceClass;
    protected _server: RoadieServer;
    constructor(script: string, data?: K);
    execute(ctx: HttpContext): Promise<void>;
}
export declare class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {
    execute(ctx: HttpContext): Promise<void>;
}
