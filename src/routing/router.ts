import { IDictionary } from "../collections";
import { Endpoint } from "../endpoints";
import { HttpVerb } from "../http";

export enum RouteType {
    unknown,
    root,
    static,
    parameter,
    wildcard,
}

export interface IRoutingResult {
    path: string[];
    params: IDictionary<string>;
    resource: Endpoint<any, any>;
    uri: string;
}

export interface IRouter {
    addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void>;
    getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult>;
}
