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
const routemap_1 = require("../static/routemap");
const asyncRouteNode_1 = require("./asyncRouteNode");
const search_1 = require("./search");
class AsyncRouter {
    getRoot(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            return new asyncRouteNode_1.AsyncRootNode();
        });
    }
    getRouteChildren(n) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    addRoute(url, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    getResource(node, verb) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    getRoute(url, verb, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            url = routemap_1.Route.normalizeURL(url);
            let search = new search_1.AsyncRouteSearch();
            search.verb = verb;
            search.initial = () => __awaiter(this, void 0, void 0, function* () {
                const root = yield this.getRoot(hostname);
                let node = new search_1.AsyncRoutingState(root);
                node.left = url.length ? url.split("/") : [];
                return [node];
            });
            search.getPossibleRoutes = (from, next, rest) => __awaiter(this, void 0, void 0, function* () {
                const all = yield this.getRouteChildren(from);
                const filtered = all.filter((n) => n.match(next, rest));
                return filtered;
            });
            let res = yield search.first();
            if (!res) {
                return { path: null, resource: null, uri: null, params: {} };
            }
            return {
                params: res.params,
                path: res.path,
                resource: yield this.getResource(res.data.data, verb),
                uri: res.uri,
            };
        });
    }
}
exports.AsyncRouter = AsyncRouter;
//# sourceMappingURL=asyncRouter.js.map