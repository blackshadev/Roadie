"use strict";
import { extend, IDictionary, Map } from "../../collections";
import { Endpoint, Endpoints, FunctionEndpoint, ScriptEndpoint, WebFunction } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult, RouteType } from "../router";
import { GreedySearch, State } from "../searching";
import { RouteSearch, StaticRoutingState } from "./route_search";

export interface IRoutes {
    [name: string]: Route;
}

export function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export interface IRouteMap {
    routes: IRoutes;
    addEndpoint(verbs: HttpVerb[], fname: any, data: any);
}

export abstract class Route implements IRouteMap {

    public static allVerbs: HttpVerb[] = (() => {
        const arr: HttpVerb[] = [];
        for (const k in HttpVerb) {
            if (typeof (HttpVerb.GET) !== typeof (HttpVerb[k])) {
                continue;
            }
            arr.push(HttpVerb[k] as any);
        }

        return arr;
    })();

    /**
     * Constructs a Route from the given urlPart
     * @param urlPart
     */
    public static Create(urlPart: string): Route {
        const m = ParameterRoute.parameterRegExp.exec(urlPart);
        if (m) {
            return new ParameterRoute(m[1]);
        }
        if (urlPart.indexOf("*") > -1) {
            return new WildcardRoute(urlPart);
        }
        return new StaticRoute(urlPart);
    }

    public static normalizeURL(url: string): string {
        url = url.replace(/[\/]+/g, "/").toLowerCase();

        if (url[0] === "/") {
            url = url.slice(1);
        }
        if (url[url.length - 1] === "/") {
            url = url.slice(0, -1);
        }

        return url;
    }

    public static splitURL(url: string): [HttpVerb[], string[]] {
        const idx = url.indexOf("]");

        // Retrieve the verbs out of the url, if none default to all verbs
        let verbs: HttpVerb[];

        if (idx > -1) {
            const arr: string[] = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map((el) => {
                const v = HttpVerb[el] as HttpVerb as any;
                if (typeof (v) !== typeof (HttpVerb.GET)) {
                    throw new Error("No such verb as `" + el + "`");
                }
                return v;
            });
            url = url.slice(idx + 1);
        } else {
            verbs = Route.allVerbs.slice(0);
        }

        // split the url up into parts
        url = Route.normalizeURL(url);
        return [verbs, url.split(/\/|\./g)];
    }
    private static urlRegexp: RegExp;

    public type: RouteType = RouteType.unknown;
    public name: string;

    // child routes
    public routes: IRoutes;

    // Endpoints bound to this Route
    public endpoints: Endpoints;

    constructor(name: string) {
        this.name = name;
        this.routes = {};
        this.endpoints = new Endpoints();
    }

    /**
     * Matches a part of an URL
     * @param urlPart part of the URL
     * @param restUrl rest of the URL (used for wildcards)
     */
    public abstract match(urlPart: string, restUrl: string): boolean;

    public addEndpoint(verbs: HttpVerb[], endpoint: Endpoint<any, any>) {
        for (const verb of verbs) {
            this.endpoints.set(verb, endpoint);
        }
    }

}

class RootRoute extends Route {

    constructor() {
        super("");
    }

    public match(urlPart: string, rest: string) { return false; }
}

/**
 * Static named routes
 */
export class StaticRoute extends Route {
    public type = RouteType.static;

    public match(urlPart: string, restUrl: string): boolean {
        return this.name === urlPart;
    }
}

/**
 * Named parameter routes
 */
export class ParameterRoute extends Route {
    public static parameterRegExp = /\{(\w+)\}/i;

    public type = RouteType.parameter;

    public match(urlPart: string, restUrl: string): boolean { return true; }
}

/**
 * Routes with a wildcard
 */
export class WildcardRoute extends Route {
    public regex: RegExp;
    public type = RouteType.wildcard;

    constructor(name: string) {
        super(name);
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", "i");

    }

    public match(urlPart: string, restUrl: string): boolean { return this.regex.test(restUrl);  }
}

export interface IUserRoutes {
    [route: string]: string;
}

export class StaticRouter implements IRouter {
    public readonly root: Route;

    constructor() {
        this.root = new RootRoute();
    }

    get routes(): IRoutes {
        return this.root.routes;
    }

    public async addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void> {
        const tmp = Route.splitURL(url);
        const verbs = tmp[0];
        const urlParts = tmp[1];

        let r: Route = this.root;
        for (const urlPart of urlParts) {
            if (!r.routes[urlPart]) {
                r.routes[urlPart] = Route.Create(urlPart);
            }
            r = r.routes[urlPart];
        }

        r.addEndpoint(verbs, endpoint);
    }

    public searchRoute(verb: HttpVerb, url: string): StaticRoutingState {
        const urlParts = Route.splitURL(url)[1];
        const s = new RouteSearch(this, urlParts, verb);
        const r = s.first();

        return r;
    }

    public async getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult>  {
        const s = this.searchRoute(verb, url);
        let end: Endpoint<any, any>;

        if (s) {
            end = s.data.endpoints.get(verb);
        }

        if (!end) {
            return { path: null, resource: null, uri: null, params: {} };
        }
        return {
            params: s.params,
            path: s.path,
            resource: end,
            uri: s.uri,
        };

    }

}
