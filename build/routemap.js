"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var endpoints_1 = require('./endpoints');
var route_search_1 = require("./route_search");
var http_1 = require("./http");
(function (RouteType) {
    RouteType[RouteType["unknown"] = 0] = "unknown";
    RouteType[RouteType["static"] = 1] = "static";
    RouteType[RouteType["parameter"] = 2] = "parameter";
    RouteType[RouteType["wildcard"] = 3] = "wildcard";
})(exports.RouteType || (exports.RouteType = {}));
var RouteType = exports.RouteType;
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
var Route = (function () {
    function Route(name) {
        this.type = RouteType.unknown;
        this.name = name;
        this.routes = {};
        this.endpoints = new endpoints_1.Endpoints();
    }
    Route.prototype.addEndpoint = function (verbs, endpoint) {
        for (var i = 0; i < verbs.length; i++)
            this.endpoints.set(verbs[i], endpoint);
    };
    Route.Create = function (urlPart) {
        var m = ParameterRoute.ParameterRegExp.exec(urlPart);
        if (m)
            return new ParameterRoute(m[1]);
        if (urlPart.indexOf("*") > -1)
            return new WildcardRoute(urlPart);
        return new StaticRoute(urlPart);
    };
    Route.splitURL = function (url) {
        var idx = url.indexOf(']');
        var verbs;
        if (idx > -1) {
            var arr = url.slice(1, idx).toUpperCase().split(",");
            verbs = arr.map(function (el) {
                var v = http_1.HttpVerb[el];
                if (typeof (v) !== typeof (http_1.HttpVerb.GET))
                    throw new Error("No such verb as `" + el + "`");
                return v;
            });
            url = url.slice(idx + 1);
        }
        else
            verbs = Route.allVerbs.slice(0);
        url = url.toLowerCase();
        if (url[0] === '/')
            url = url.slice(1);
        if (url[url.length - 1] === '/')
            url = url.slice(0, -1);
        return [verbs, url.split('/')];
    };
    Route.allVerbs = (function () {
        var arr = [];
        for (var k in http_1.HttpVerb) {
            if (typeof (http_1.HttpVerb.GET) !== typeof (http_1.HttpVerb[k]))
                continue;
            arr.push(http_1.HttpVerb[k]);
        }
        return arr;
    })();
    return Route;
}());
exports.Route = Route;
var RootRoute = (function (_super) {
    __extends(RootRoute, _super);
    function RootRoute() {
        _super.call(this, "");
    }
    RootRoute.prototype.match = function (urlPart, rest) { return false; };
    return RootRoute;
}(Route));
var StaticRoute = (function (_super) {
    __extends(StaticRoute, _super);
    function StaticRoute() {
        _super.apply(this, arguments);
        this.type = RouteType.static;
    }
    StaticRoute.prototype.match = function (urlPart, restUrl) {
        return this.name === urlPart;
    };
    return StaticRoute;
}(Route));
exports.StaticRoute = StaticRoute;
var ParameterRoute = (function (_super) {
    __extends(ParameterRoute, _super);
    function ParameterRoute() {
        _super.apply(this, arguments);
        this.type = RouteType.parameter;
    }
    ParameterRoute.prototype.match = function (urlPart, restUrl) { return true; };
    ParameterRoute.ParameterRegExp = /\{(\w+)\}/i;
    return ParameterRoute;
}(Route));
exports.ParameterRoute = ParameterRoute;
var WildcardRoute = (function (_super) {
    __extends(WildcardRoute, _super);
    function WildcardRoute(name) {
        _super.call(this, name);
        this.type = RouteType.wildcard;
        this.regex = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", 'i');
    }
    WildcardRoute.prototype.match = function (urlPart, restUrl) { return this.regex.test(restUrl); };
    return WildcardRoute;
}(Route));
exports.WildcardRoute = WildcardRoute;
var RouteMap = (function () {
    function RouteMap() {
        this.root = new RootRoute();
    }
    Object.defineProperty(RouteMap.prototype, "routes", {
        get: function () {
            return this.root.routes;
        },
        enumerable: true,
        configurable: true
    });
    RouteMap.prototype.addRoute = function (url, endpoint) {
        var tmp = Route.splitURL(url);
        var verbs = tmp[0];
        var urlParts = tmp[1];
        var r = this.root;
        for (var i = 0; i < urlParts.length; i++) {
            var urlPart = urlParts[i];
            if (!r.routes[urlPart]) {
                r.routes[urlPart] = Route.Create(urlPart);
            }
            r = r.routes[urlPart];
        }
        r.addEndpoint(verbs, endpoint);
    };
    RouteMap.prototype.searchRoute = function (verb, url) {
        var urlParts = Route.splitURL(url)[1];
        var s = new route_search_1.RouteSearch(this, urlParts, verb);
        var r = s.first();
        return r;
    };
    RouteMap.prototype.getRoute = function (url, verb) {
        var s = this.searchRoute(verb, url);
        var end;
        if (s)
            end = s.data.endpoints.get(verb);
        if (!end)
            return { path: null, resource: null, uri: null, params: {} };
        return {
            path: s.path,
            params: s.params,
            resource: end,
            uri: s.uri
        };
    };
    return RouteMap;
}());
exports.RouteMap = RouteMap;
//# sourceMappingURL=routemap.js.map