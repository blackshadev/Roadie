import { Endpoint } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult, RouteType } from "../router";
export interface IRoute<T> {
    type: RouteType;
    data: T;
}
export declare abstract class AsyncRouteNode<T> implements IRoute<T> {
    readonly type: RouteType;
    readonly data: T;
    readonly leafs: HttpVerb;
    readonly name: string;
    constructor(oPar?: {
        name?: string;
        data?: T;
        leafs?: HttpVerb;
    });
    abstract match(n: string, rest: string): boolean;
}
export declare class AsyncRootNode<T> extends AsyncRouteNode<T> {
    readonly type: RouteType;
    match(n: string, rest: string): boolean;
}
export declare class AsyncParameterNode<T> extends AsyncRouteNode<T> {
    readonly type: RouteType;
    match(n: string, rest: string): boolean;
}
export declare class AsyncWildcardNode<T> extends AsyncRouteNode<T> {
    readonly type: RouteType;
    private readonly re;
    constructor(oPar: any);
    match(n: string, rest: string): boolean;
}
export declare class AsyncStaticNode<T> extends AsyncRouteNode<T> {
    readonly type: RouteType;
    match(n: string, rest: string): boolean;
}
export declare class AsyncRouter<T> implements IRouter {
    getRoot(hostname: string): Promise<AsyncRouteNode<T>>;
    getRouteChildren(n: AsyncRouteNode<T>): Promise<AsyncRouteNode<T>[]>;
    addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void>;
    getResource(d: T): Promise<Endpoint<any, any>>;
    getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult>;
}
