import { IDictionary } from "./collections";
import { Endpoint, Endpoints } from './endpoints';
import { RoutingState } from "./route_search";
import { HttpVerb } from "./http";
export declare enum RouteType {
    unknown = 0,
    static = 1,
    parameter = 2,
    wildcard = 3,
}
export interface Routes {
    [name: string]: Route;
}
export interface IRouteMap {
    routes: Routes;
    addEndpoint(verbs: HttpVerb[], fname: any, data: any): any;
}
export declare abstract class Route implements IRouteMap {
    static allVerbs: HttpVerb[];
    type: RouteType;
    name: string;
    routes: Routes;
    endpoints: Endpoints;
    constructor(name: string);
    abstract match(urlPart: string, restUrl: string): boolean;
    addEndpoint(verbs: HttpVerb[], endpoint: Endpoint<any, any>): void;
    static Create(urlPart: string): Route;
    static splitURL(url: string): [HttpVerb[], string[]];
}
export declare class StaticRoute extends Route {
    type: RouteType;
    match(urlPart: string, restUrl: string): boolean;
}
export declare class ParameterRoute extends Route {
    static ParameterRegExp: RegExp;
    type: RouteType;
    match(urlPart: string, restUrl: string): boolean;
}
export declare class WildcardRoute extends Route {
    regex: RegExp;
    type: RouteType;
    constructor(name: string);
    match(urlPart: string, restUrl: string): boolean;
}
export interface IUserRoutes {
    [route: string]: string;
}
export interface IRoutingResult {
    path: string[];
    params: IDictionary<string>;
    resource: Endpoint<any, any>;
    uri: string;
}
export declare class RouteMap {
    root: Route;
    readonly routes: Routes;
    constructor();
    addRoute(url: string, endpoint: Endpoint<any, any>): void;
    searchRoute(verb: HttpVerb, url: string): RoutingState;
    getRoute(url: string, verb: HttpVerb): IRoutingResult;
}
