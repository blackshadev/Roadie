"use strict";
import { Map, extend } from "./collections";
import { State, GreedySearch } from "./searching";



enum RouteType {
    unknown,
    static,
    parameter,
    wildcard
}

interface Routes {
    [name: string]: Route
}

class Endpoint<T, K> {
    script: T;
    data: K;

    constructor(script : T, data : K) {
        this.script = script;
        this.data = data;
    }

    static Create<T>(script: string | WebFunction, data: T) : Endpoint<any, T> {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint<T>(<WebFunction>script, data);
            case "string": return new ScriptEndpoint<T>(<string>script, data);
        }
        return;
    }
}

class ScriptEndpoint<K> extends Endpoint<string, K> {

}

type WebFunction = ((ctx: any) => void);

class FunctionEndpoint<K> extends Endpoint<WebFunction, K> {

}

export enum HttpVerb {
    "GET" = 0,
    "POST",
    "PUT",
    "DELETE",
    "UPGRADE",
    "TRACE",
    "HEAD",
    "OPTIONS",
    "UPDATE"
}

class Endpoints extends Map<HttpVerb, Endpoint<any, any>> { }
    
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

interface IRouteMap {
    routes: Routes;
    addEndpoint(verbs: HttpVerb[], fname:any, data:any);
}


export abstract class Route implements IRouteMap {


    static allVerbs: HttpVerb[] = (() => {
        let arr: HttpVerb[] = [];
        for (var k in HttpVerb) {
            if (typeof (HttpVerb.GET) !== typeof (HttpVerb[k])) continue;
            arr.push(<any>HttpVerb[k]);
        }
        

        return arr;
    })(); 


    type: RouteType = RouteType.unknown;
    name: string;
    
    // child routes
    routes: Routes 

    // Endpoints bound to this Route
    endpoints: Endpoints;


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
    abstract match(urlPart: string, restUrl: string) : boolean;

    addEndpoint(verbs: HttpVerb[], script: any, data: any) {
        for (let i = 0; i < verbs.length; i++)
            this.endpoints.set(verbs[i], Endpoint.Create(script, data));
    }

    /**
     * Constructs a Route from the given urlPart
     * @param urlPart 
     */
    static Create(urlPart: string): Route {
        let m = ParameterRoute.ParameterRegExp.exec(urlPart);
        if (m) return new ParameterRoute(m[1]);
        if (urlPart.indexOf("*") > -1) return new WildcardRoute(urlPart);
        return new StaticRoute(urlPart);
    }

    static splitURL(url: string): [HttpVerb[], string[]] {
        var idx = url.indexOf(']');

        // Retrieve the verbs out of the url, if none default to all verbs
        let verbs: HttpVerb[];

        if (idx > -1) {
            const arr : string[] = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map((el) => {
                let v = <HttpVerb><any>HttpVerb[el];
                if (typeof (v) !== typeof (HttpVerb.GET)) throw new Error("No such verb as `" + el + "`")
                return v;
            });
            url = url.slice(idx + 1);
        } else 
            verbs = Route.allVerbs.slice(0);
        

        // split the url up into parts
        url = url.toLowerCase();
        if (url[0] === '/') url = url.slice(1);
        if (url[url.length - 1] === '/') url = url.slice(0, -1);

        return [verbs, url.split('/')];
    }
}

class RootRoute extends Route {

    constructor() {
        super("");
    }

    match(urlPart: string, rest: string) { return false; }
}

/**
 * Static named routes
 */
export class StaticRoute extends Route {
    type = RouteType.static;

    match(urlPart: string, restUrl: string): boolean {
        return this.name === urlPart;
    }
}

/**
 * Named parameter routes
 */
export class ParameterRoute extends Route {
    static ParameterRegExp = /\{(\w+)\}/i;

    type = RouteType.parameter;
    
    match(urlPart: string, restUrl: string): boolean { return true; }
}

/**
 * Routes with a wildcard
 */
export class WildcardRoute extends Route {
    regex: RegExp;
    type = RouteType.wildcard;

    constructor(name: string) {
        super(name);
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", 'i');

    }

    match(urlPart: string, restUrl: string): boolean { return this.regex.test(restUrl);  }
}


export interface IUserRoutes {
    [route: string]: string
}

export class RouteMap {
    root: Route;
    get routes(): Routes {
        return this.root.routes;
    }

    constructor() {
        this.root = new RootRoute();
    }

    addEndpoint(verbs: HttpVerb[], fname: any, data: any) { throw new Error("Should not come here"); }

    load(json: IUserRoutes) {
        for (var k in json) this.addRoute(k, json[k]);
    }

    addRoute(url: string, resource: any, data?: any) {
        const tmp = Route.splitURL(url);
        const verbs = tmp[0];
        const urlParts = tmp[1];

        let r: Route = this.root;
        for (let i = 0; i < urlParts.length; i++) {
            let urlPart = urlParts[i];
            if (!r.routes[urlPart]) {
                r.routes[urlPart] = Route.Create(urlPart);
            }
            r = r.routes[urlPart];
        }

        r.addEndpoint(verbs, resource, data);
    }

    searchRoute(verb: HttpVerb, url: string): RoutingState {
        let urlParts = Route.splitURL(url)[1];
        let s = new RouteSearch(this, urlParts, verb);
        let r = s.first();

        return r;
    }

    getRoute(url: string, verb: string): { path: string[], params: {}, resource: Endpoint<any, any>, uri: string }  {
        let v: HttpVerb = HttpVerb[verb];
        if (typeof (HttpVerb.GET) !== typeof (v)) throw new Error("Invalid HttpVerb");

        let s = this.searchRoute(v, url);

        if (s) {
            let resource = s.data.endpoints.get(v);

            return {
                path: s.path,
                params: s.params,
                resource: resource,
                uri: s.uri
            };
        }

        return;
    }

    
}

class RoutingState extends State<string, Route> {
    penalty: number = 0;
    
    // Collected parameters
    params: { [name: string]: any } = [];

    // Collects wildcard leftovers
    uri: string = "";

    get cost(): number { return this.path.length + this.penalty; }

    // Get Possible routes to take from this state
    getPossibleRoutes(part, rest): Route[] {
        let arr: Route[] = [];
        for (let k in this.data.routes) {
            if (this.data.routes[k].match(part, rest))
                arr.push(this.data.routes[k]);
        }

        return arr;
    }

    clone(): RoutingState {
        let s = new RoutingState(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = extend({}, this.params);

        return s;
    }
}

class RouteSearch extends GreedySearch<RoutingState> {
    RouteMap: RouteMap;
    urlParts: string[];
    verb: HttpVerb;

    constructor(rm: RouteMap, urlParts: string[], verb: HttpVerb) {
        super();
        this.RouteMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }

    goal(s: RoutingState): boolean {
        return !s.left.length && (!this.verb || !!s.data.endpoints.get(this.verb));
    }

    initial(): RoutingState[] {
        let s = new RoutingState(this.RouteMap.root);
        s.left = this.urlParts;
        
        return [s];
    }

    move(s: RoutingState): RoutingState[] {

        var r = s.data;
        var n = s.left.shift();
        var rest = s.left.length ? n + "/" + s.left.join("/") : n;

        var arr = s.getPossibleRoutes(n, rest);

        var self = this;
        var states = arr.map(function (e) {
            // s = state, ns= newstate
            var ns = s.clone();
            ns.data = e;
            ns.path.push(e.name);
            
            switch (e.type) {
                case RouteType.parameter:
                    ns.penalty += 1;
                    ns.params[e.name] = n;
                    break;
                case RouteType.wildcard:
                    ns.uri = rest;
                    ns.penalty += ns.uri.length - (e.name.length - 1)
                    ns.left.length = 0;
                    break;
            }
                        
            // Route debugging
            // console.log(sprintf('[Routing] %-25s: %s', ns.path.join("/"), ns.penalty));
                        
            return ns;
        });

        return states;

        return [];
    }
}