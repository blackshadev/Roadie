import { HttpVerb } from "../../http";
import { GreedySearch, State } from "../searching";
import { Route, StaticRouter } from "./routemap";
export interface IRoutingState {
    getPossibleRoutes(part: any, rest: any): Route[];
}
export declare class RoutingState<T> extends State<string, T> {
    penalty: number;
    params: {
        [name: string]: any;
    };
    uri: string;
    readonly cost: number;
    clone(): this;
}
export declare class StaticRoutingState extends RoutingState<Route> {
    getPossibleRoutes(part: any, rest: any): Route[];
    clone(): this;
}
export declare class RouteSearch extends GreedySearch<StaticRoutingState> {
    routeMap: StaticRouter;
    urlParts: string[];
    verb: HttpVerb;
    constructor(rm: StaticRouter, urlParts: string[], verb: HttpVerb);
    goal(s: StaticRoutingState): boolean;
    initial(): StaticRoutingState[];
    move(s: StaticRoutingState): StaticRoutingState[];
}
