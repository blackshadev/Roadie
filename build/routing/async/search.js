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
const router_1 = require("../router");
const searching_1 = require("../searching");
const route_search_1 = require("../static/route_search");
class AsyncSearch extends searching_1.Search {
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.nodes.clear();
            this.nodes.addAll(yield this.initial());
        });
    }
    first() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.reset();
            return this.next();
        });
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.nodes.length > 0) {
                const state = this.nodes.items.shift();
                if (this.goal(state)) {
                    return state;
                }
                const arr = yield this.move(state);
                this.nodes.addAll(arr);
            }
            return;
        });
    }
}
exports.AsyncSearch = AsyncSearch;
class AsyncRoutingState extends route_search_1.RoutingState {
    constructor() {
        super(...arguments);
        this.leafs = 0;
    }
    clone() {
        let s = super.clone();
        s.leafs = this.leafs;
        return s;
    }
}
exports.AsyncRoutingState = AsyncRoutingState;
class AsyncRouteSearch extends AsyncSearch {
    getPossibleRoutes(from, next, rest) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    initial() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    move(s) {
        return __awaiter(this, void 0, void 0, function* () {
            const n = s.left.shift();
            const rest = s.left.length ? n + "/" + s.left.join("/") : n;
            if (n === undefined) {
                return [];
            }
            const arr = yield this.getPossibleRoutes(s.data, n, rest);
            const states = arr.map((e) => {
                const ns = s.clone();
                ns.data = e;
                ns.leafs = e.leafs;
                ns.path.push(e.name);
                switch (e.type) {
                    case router_1.RouteType.parameter:
                        ns.penalty += 1;
                        ns.params[e.name] = decodeURIComponent(n);
                        break;
                    case router_1.RouteType.wildcard:
                        ns.uri = rest;
                        ns.penalty += ns.uri.length - (e.name.length - 1);
                        ns.left.length = 0;
                        break;
                    default: break;
                }
                return ns;
            });
            return states;
        });
    }
    goal(state) {
        return state.left.length === 0 && (state.leafs & this.verb) !== 0;
    }
}
exports.AsyncRouteSearch = AsyncRouteSearch;
//# sourceMappingURL=search.js.map