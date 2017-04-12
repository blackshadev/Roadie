import { Endpoint } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult } from "../router";
import { AsyncRouteNode } from "./asyncRouteNode";
import { AsyncRoutingState } from "./search";
export interface IRouteStateConstructor<T> {
    new (data: AsyncRouteNode<T>, left: string[]): AsyncRoutingState<T>;
}
export declare class AsyncRouter<T> implements IRouter {
    newState(node: AsyncRouteNode<T>, path: string[]): AsyncRoutingState<T>;
    getRoot(hostname: string): Promise<AsyncRouteNode<T>[]>;
    getRouteChildren(n: AsyncRouteNode<T>): Promise<AsyncRouteNode<T>[]>;
    addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void>;
    getResource(node: AsyncRouteNode<T>, verb: HttpVerb): Promise<Endpoint<any, any>>;
    getRoutingResult(res: AsyncRoutingState<T>, url: string, verb: HttpVerb, hostname?: string): Promise<IRoutingResult>;
    getRoute(url: string, verb: HttpVerb, hostname?: string): Promise<IRoutingResult>;
}
