import { State, GreedySearch } from "./searching";
import { Route, RouteMap } from "./routemap";
import { HttpVerb } from "./http";
export declare class RoutingState extends State<string, Route> {
    penalty: number;
    params: {
        [name: string]: any;
    };
    uri: string;
    readonly cost: number;
    getPossibleRoutes(part: any, rest: any): Route[];
    clone(): RoutingState;
}
export declare class RouteSearch extends GreedySearch<RoutingState> {
    RouteMap: RouteMap;
    urlParts: string[];
    verb: HttpVerb;
    constructor(rm: RouteMap, urlParts: string[], verb: HttpVerb);
    goal(s: RoutingState): boolean;
    initial(): RoutingState[];
    move(s: RoutingState): RoutingState[];
}
