"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const endpoints_1 = require("../../endpoints");
const http_1 = require("../../http");
const router_1 = require("../router");
const route_search_1 = require("./route_search");
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
exports.escapeRegex = escapeRegex;
class Route {
    constructor(name) {
        this.type = router_1.RouteType.unknown;
        this.name = name;
        this.routes = {};
        this.endpoints = new endpoints_1.Endpoints();
    }
    static Create(urlPart) {
        const m = ParameterRoute.parameterRegExp.exec(urlPart);
        if (m) {
            return new ParameterRoute(m[1]);
        }
        if (urlPart.indexOf("*") > -1) {
            return new WildcardRoute(urlPart);
        }
        return new StaticRoute(urlPart);
    }
    static normalizeURL(url) {
        url = url.replace(/[\/]+/g, "/").toLowerCase();
        if (url[0] === "/") {
            url = url.slice(1);
        }
        if (url[url.length - 1] === "/") {
            url = url.slice(0, -1);
        }
        return url;
    }
    static splitURL(url) {
        const idx = url.indexOf("]");
        let verbs;
        if (idx > -1) {
            const arr = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map((el) => {
                const v = http_1.HttpVerb[el];
                if (typeof (v) !== typeof (http_1.HttpVerb.GET)) {
                    throw new Error("No such verb as `" + el + "`");
                }
                return v;
            });
            url = url.slice(idx + 1);
        }
        else {
            verbs = http_1.allVerbs.slice(0);
        }
        url = Route.normalizeURL(url);
        return [verbs, url.split(/\//g)];
    }
    addEndpoint(verbs, endpoint) {
        for (const verb of verbs) {
            this.endpoints.set(verb, endpoint);
        }
    }
}
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
        this.type = router_1.RouteType.static;
    }
    match(urlPart, restUrl) {
        return this.name === urlPart;
    }
}
exports.StaticRoute = StaticRoute;
class ParameterRoute extends Route {
    constructor() {
        super(...arguments);
        this.type = router_1.RouteType.parameter;
    }
    match(urlPart, restUrl) { return true; }
}
ParameterRoute.parameterRegExp = /\{(\w+)\}/i;
exports.ParameterRoute = ParameterRoute;
class WildcardRoute extends Route {
    constructor(name) {
        super(name);
        this.type = router_1.RouteType.wildcard;
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", "i");
    }
    match(urlPart, restUrl) { return this.regex.test(restUrl); }
}
exports.WildcardRoute = WildcardRoute;
class StaticRouter {
    constructor() {
        this.root = new RootRoute();
    }
    get routes() {
        return this.root.routes;
    }
    addRoute(url, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmp = Route.splitURL(url);
            const verbs = tmp[0];
            const urlParts = tmp[1];
            let r = this.root;
            for (const urlPart of urlParts) {
                if (!r.routes[urlPart]) {
                    r.routes[urlPart] = Route.Create(urlPart);
                }
                r = r.routes[urlPart];
            }
            r.addEndpoint(verbs, endpoint);
        });
    }
    searchRoute(verb, url) {
        const urlParts = Route.splitURL(url)[1];
        const s = new route_search_1.RouteSearch(this, urlParts, verb);
        const r = s.first();
        return r;
    }
    getRoute(url, verb, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const s = this.searchRoute(verb, hostname !== undefined ? hostname + url : url);
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
        });
    }
}
exports.StaticRouter = StaticRouter;
//# sourceMappingURL=routemap.js.map