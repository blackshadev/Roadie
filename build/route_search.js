"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var searching_1 = require("./searching");
var routemap_1 = require("./routemap");
var collections_1 = require("./collections");
var RoutingState = (function (_super) {
    __extends(RoutingState, _super);
    function RoutingState() {
        _super.apply(this, arguments);
        this.penalty = 0;
        this.params = [];
        this.uri = "";
    }
    Object.defineProperty(RoutingState.prototype, "cost", {
        get: function () { return this.path.length + this.penalty; },
        enumerable: true,
        configurable: true
    });
    RoutingState.prototype.getPossibleRoutes = function (part, rest) {
        var arr = [];
        for (var k in this.data.routes) {
            if (this.data.routes[k].match(part, rest))
                arr.push(this.data.routes[k]);
        }
        return arr;
    };
    RoutingState.prototype.clone = function () {
        var s = new RoutingState(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = collections_1.extend({}, this.params);
        return s;
    };
    return RoutingState;
}(searching_1.State));
exports.RoutingState = RoutingState;
var RouteSearch = (function (_super) {
    __extends(RouteSearch, _super);
    function RouteSearch(rm, urlParts, verb) {
        _super.call(this);
        this.RouteMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }
    RouteSearch.prototype.goal = function (s) {
        return s.left.length === 0 && (this.verb === undefined || !!s.data.endpoints.get(this.verb));
    };
    RouteSearch.prototype.initial = function () {
        var s = new RoutingState(this.RouteMap.root);
        s.left = this.urlParts;
        return [s];
    };
    RouteSearch.prototype.move = function (s) {
        var r = s.data;
        var n = s.left.shift();
        var rest = s.left.length ? n + "/" + s.left.join("/") : n;
        var arr = s.getPossibleRoutes(n, rest);
        var self = this;
        var states = arr.map(function (e) {
            var ns = s.clone();
            ns.data = e;
            ns.path.push(e.name);
            switch (e.type) {
                case routemap_1.RouteType.parameter:
                    ns.penalty += 1;
                    ns.params[e.name] = n;
                    break;
                case routemap_1.RouteType.wildcard:
                    ns.uri = rest;
                    ns.penalty += ns.uri.length - (e.name.length - 1);
                    ns.left.length = 0;
                    break;
            }
            return ns;
        });
        return states;
    };
    return RouteSearch;
}(searching_1.GreedySearch));
exports.RouteSearch = RouteSearch;
//# sourceMappingURL=route_search.js.map