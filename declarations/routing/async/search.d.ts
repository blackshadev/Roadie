import { HttpVerb } from "../../http";
import { Search, State } from "../searching";
import { RoutingState } from "../static/route_search";
import { AsyncRouteNode } from "./asyncRouteNode";
export declare abstract class AsyncSearch<S extends State<any, any>> extends Search<S> {
    reset(): Promise<void>;
    first(): Promise<S>;
    next(): Promise<S | undefined>;
    protected abstract initial(): Promise<S[]>;
    protected abstract move(state: S): Promise<S[]>;
    protected abstract goal(state: S): boolean;
}
export declare class AsyncRoutingState<T> extends RoutingState<AsyncRouteNode<T>> {
    leafs: HttpVerb;
    clone(): this;
}
export declare class AsyncRouteSearch<T> extends AsyncSearch<AsyncRoutingState<T>> {
    verb: HttpVerb;
    getPossibleRoutes(from: AsyncRouteNode<T>, next: string, rest: string): Promise<AsyncRouteNode<T>[]>;
    initial(): Promise<AsyncRoutingState<T>[]>;
    move(s: AsyncRoutingState<T>): Promise<AsyncRoutingState<T>[]>;
    goal(state: AsyncRoutingState<T>): boolean;
}
