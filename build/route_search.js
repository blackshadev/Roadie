"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collections_1 = require("./collections");
const routemap_1 = require("./routemap");
const searching_1 = require("./searching");
{
}
class RoutingState extends searching_1.State {
    constructor() {
        super(...arguments);
        this.penalty = 0;
        this.params = [];
        this.uri = "";
    }
    get cost() { return this.path.length + this.penalty; }
    getPossibleRoutes(part, rest) {
        const arr = [];
        for (const k in this.data.routes) {
            if (this.data.routes[k].match(part, rest)) {
                arr.push(this.data.routes[k]);
            }
        }
        return arr;
    }
    clone() {
        const s = new RoutingState(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = collections_1.extend({}, this.params);
        return s;
    }
}
exports.RoutingState = RoutingState;
class RouteSearch extends searching_1.GreedySearch {
    constructor(rm, urlParts, verb) {
        super();
        this.routeMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }
    goal(s) {
        return s.left.length === 0 && (this.verb === undefined || !!s.data.endpoints.get(this.verb));
    }
    initial() {
        const s = new RoutingState(this.routeMap.root);
        s.left = this.urlParts;
        return [s];
    }
    move(s) {
        const r = s.data;
        const n = s.left.shift();
        const rest = s.left.length ? n + "/" + s.left.join("/") : n;
        const arr = s.getPossibleRoutes(n, rest);
        const states = arr.map((e) => {
            const ns = s.clone();
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
                default: break;
            }
            return ns;
        });
        return states;
    }
}
exports.RouteSearch = RouteSearch;
//# sourceMappingURL=route_search.js.map