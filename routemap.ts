"use strict";
import { Map } from "./collections";
import { State, GreedySearch } from "./searching";



enum RouteType {
    static = 0,
    parameter,
    wildcard
}

interface Routes {
    [name: string]: Route
}

class Endpoint<T> {
    script: string;
    data: T;

    constructor(fname : string, data : T) {
        this.script = fname;
        this.data = data;
    }
}

export enum HttpVerbs {
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

class Endpoints extends Map<HttpVerbs, Endpoint<any>> { }
    
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

interface IRouteMap {
    routes: Routes;
    addEndpoint(verbs: HttpVerbs[], fname:any, data:any);
}

export abstract class Route implements IRouteMap {
    static allVerbs: HttpVerbs[] = (() => {
        let arr: HttpVerbs[] = [];
        for (var k in HttpVerbs) {
            if (typeof (HttpVerbs.GET) !== typeof (HttpVerbs[k])) continue;
            arr.push(<any>HttpVerbs[k]);
        }
        

        return arr;
    })(); 

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

    addEndpoint(verbs: HttpVerbs[], fname: any, data: any) {
        for (let i = 0; i < verbs.length; i++)
            this.endpoints.set(verbs[i], new Endpoint(fname, data));
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

    static splitURL(url: string): [HttpVerbs[], string[]] {
        var idx = url.indexOf(']');

        // Retrieve the verbs out of the url, if none default to all verbs
        let verbs: HttpVerbs[];

        if (idx > -1) {
            const arr : string[] = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map((el) => {
                let v = <HttpVerbs><any>HttpVerbs[el];
                if(!v) throw new Error("No such verb as `" + el + "`")
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

/**
 * Static named routes
 */
export class StaticRoute extends Route {
    match(urlPart: string, restUrl: string): boolean {
        return this.name === urlPart;
    }
}

/**
 * Named parameter routes
 */
export class ParameterRoute extends Route {
    static ParameterRegExp = /\{(\w+)\}/i;
    
    match(urlPart: string, restUrl: string): boolean { return true; }
}

/**
 * Routes with a wildcard
 */
export class WildcardRoute extends Route {
    regex: RegExp;

    constructor(name: string) {
        super(name);
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", 'i');

    }

    match(urlPart: string, restUrl: string): boolean { return this.regex.test(restUrl);  }
}


export interface IUserRoutes {
    [route: string]: string
}

export class RouteMap implements IRouteMap {
    routes: Routes;

    constructor() {
        this.routes = {};
    }

    load(json: IUserRoutes) {
        for (var k in json) this.addRoute(k, json[k]);
    }

    addRoute(url: string, resource: any, data?: any) {
        const tmp = Route.splitURL(url);
        const verbs = tmp[0];
        const urlParts = tmp[1];

        let r: IRouteMap = this;
        for (let i = 0; i < urlParts.length; i++) {
            let urlPart = urlParts[i];
            if (!r.routes[urlPart]) {
                r.routes[urlPart] = Route.Create(urlPart);
            }
            r = r.routes[urlPart];
        }

        r.addEndpoint(verbs, resource, data);
    }

    addEndpoint(verbs: HttpVerbs[], fname: any, data: any) { throw new Error("Should not come here"); }

}