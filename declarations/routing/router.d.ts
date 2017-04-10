import { IDictionary } from "../collections";
import { Endpoint } from "../endpoints";
import { HttpVerb } from "../http";
export declare enum RouteType {
    unknown = 0,
    root = 1,
    static = 2,
    parameter = 3,
    wildcard = 4,
}
export interface IRoutingResult {
    path: string[];
    params: IDictionary<string>;
    resource: Endpoint<any, any>;
    uri: string;
}
export interface IRouter {
    addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void>;
    getRoute(url: string, verb: HttpVerb, hostname?: string): Promise<IRoutingResult>;
}
