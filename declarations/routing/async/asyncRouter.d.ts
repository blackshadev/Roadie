import { Endpoint } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult } from "../router";
import { AsyncRouteNode } from "./asyncRouteNode";
export declare class AsyncRouter<T> implements IRouter {
    getRoot(hostname: string): Promise<AsyncRouteNode<T>>;
    getRouteChildren(n: AsyncRouteNode<T>): Promise<AsyncRouteNode<T>[]>;
    addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void>;
    getResource(node: T, verb: HttpVerb): Promise<Endpoint<any, any>>;
    getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult>;
}
