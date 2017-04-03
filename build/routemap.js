"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const endpoints_1 = require("./endpoints");
const http_1 = require("./http");
const route_search_1 = require("./route_search");
var RouteType;
(function (RouteType) {
    RouteType[RouteType["unknown"] = 0] = "unknown";
    RouteType[RouteType["static"] = 1] = "static";
    RouteType[RouteType["parameter"] = 2] = "parameter";
    RouteType[RouteType["wildcard"] = 3] = "wildcard";
})(RouteType = exports.RouteType || (exports.RouteType = {}));
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
class Route {
    constructor(name) {
        this.type = RouteType.unknown;
        this.name = name;
        this.routes = {};
        this.endpoints = new endpoints_1.Endpoints();
    }
    static Create(urlPart) {
        let m = ParameterRoute.parameterRegExp.exec(urlPart);
        if (m) {
            return new ParameterRoute(m[1]);
        }
        if (urlPart.indexOf("*") > -1) {
            return new WildcardRoute(urlPart);
        }
        return new StaticRoute(urlPart);
    }
    static splitURL(url) {
        let idx = url.indexOf("]");
        let verbs;
        if (idx > -1) {
            const arr = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map((el) => {
                let v = http_1.HttpVerb[el];
                if (typeof (v) !== typeof (http_1.HttpVerb.GET)) {
                    throw new Error("No such verb as `" + el + "`");
                }
                return v;
            });
            url = url.slice(idx + 1);
        }
        else {
            verbs = Route.allVerbs.slice(0);
        }
        url = url.toLowerCase();
        if (url[0] === "/") {
            url = url.slice(1);
        }
        if (url[url.length - 1] === "/") {
            url = url.slice(0, -1);
        }
        return [verbs, url.split(/\/|\./g)];
    }
    addEndpoint(verbs, endpoint) {
        for (let verb of verbs) {
            this.endpoints.set(verb, endpoint);
        }
    }
}
Route.allVerbs = (() => {
    let arr = [];
    for (let k in http_1.HttpVerb) {
        if (typeof (http_1.HttpVerb.GET) !== typeof (http_1.HttpVerb[k])) {
            continue;
        }
        arr.push(http_1.HttpVerb[k]);
    }
    return arr;
})();
exports.Route = Route;
class RootRoute extends Route {
    constructor() {
        super("");
    }
    match(urlPart, rest) { return false; }
}
class StaticRoute extends Route {
    constructor() {
        super(...arguments);
        this.type = RouteType.static;
    }
    match(urlPart, restUrl) {
        return this.name === urlPart;
    }
}
exports.StaticRoute = StaticRoute;
class ParameterRoute extends Route {
    constructor() {
        super(...arguments);
        this.type = RouteType.parameter;
    }
    match(urlPart, restUrl) { return true; }
}
ParameterRoute.parameterRegExp = /\{(\w+)\}/i;
exports.ParameterRoute = ParameterRoute;
class WildcardRoute extends Route {
    constructor(name) {
        super(name);
        this.type = RouteType.wildcard;
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", "i");
    }
    match(urlPart, restUrl) { return this.regex.test(restUrl); }
}
exports.WildcardRoute = WildcardRoute;
class RouteMap {
    get routes() {
        return this.root.routes;
    }
    constructor() {
        this.root = new RootRoute();
    }
    addRoute(url, endpoint) {
        const tmp = Route.splitURL(url);
        const verbs = tmp[0];
        const urlParts = tmp[1];
        let r = this.root;
        for (let urlPart of urlParts) {
            if (!r.routes[urlPart]) {
                r.routes[urlPart] = Route.Create(urlPart);
            }
            r = r.routes[urlPart];
        }
        r.addEndpoint(verbs, endpoint);
    }
    searchRoute(verb, url) {
        let urlParts = Route.splitURL(url)[1];
        let s = new route_search_1.RouteSearch(this, urlParts, verb);
        let r = s.first();
        return r;
    }
    getRoute(url, verb) {
        let s = this.searchRoute(verb, url);
        let end;
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
exports.RouteMap = RouteMap;
//# sourceMappingURL=routemap.js.map