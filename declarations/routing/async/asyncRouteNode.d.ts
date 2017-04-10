import { HttpVerb } from "../../http";
import { RouteType } from "../router";
export interface IRoute<T> {
    type: RouteType;
    data: T;
}
export interface IAsyncNodeParams<T> {
    name?: string;
    data?: T;
    leafs?: HttpVerb;
}
export declare abstract class AsyncRouteNode<T> implements IRoute<T> {
    static Create<T>(type: RouteType, oPar: IAsyncNodeParams<T>): AsyncRouteNode<T>;
    readonly type: RouteType;
    readonly data: T;
    readonly leafs: HttpVerb;
    readonly name: string;
    constructor(oPar?: IAsyncNodeParams<T>);
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
