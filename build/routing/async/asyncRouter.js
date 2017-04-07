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
const url_1 = require("url");
const router_1 = require("../router");
const routemap_1 = require("../static/routemap");
const search_1 = require("./search");
class AsyncRouteNode {
    constructor(oPar = {}) {
        this.type = router_1.RouteType.unknown;
        this.name = oPar.name || "";
        this.data = oPar.data;
        this.leafs = oPar.leafs || 0;
    }
}
exports.AsyncRouteNode = AsyncRouteNode;
class AsyncRootNode extends AsyncRouteNode {
    constructor() {
        super(...arguments);
        this.type = router_1.RouteType.root;
    }
    match(n, rest) {
        return true;
    }
}
exports.AsyncRootNode = AsyncRootNode;
class AsyncParameterNode extends AsyncRouteNode {
    constructor() {
        super(...arguments);
        this.type = router_1.RouteType.parameter;
    }
    match(n, rest) {
        return true;
    }
}
exports.AsyncParameterNode = AsyncParameterNode;
class AsyncWildcardNode extends AsyncRouteNode {
    constructor(oPar) {
        super(oPar);
        this.type = router_1.RouteType.wildcard;
        this.re = new RegExp("^" + routemap_1.escapeRegex(this.name).replace("\\*", ".*") + "$", "i");
    }
    match(n, rest) {
        return this.re.test(rest);
    }
}
exports.AsyncWildcardNode = AsyncWildcardNode;
class AsyncStaticNode extends AsyncRouteNode {
    constructor() {
        super(...arguments);
        this.type = router_1.RouteType.static;
    }
    match(n, rest) {
        return this.name === n;
    }
}
exports.AsyncStaticNode = AsyncStaticNode;
class AsyncRouter {
    getRoot(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            return new AsyncRootNode();
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
    getResource(d) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    getRoute(url, verb) {
        return __awaiter(this, void 0, void 0, function* () {
            let parsedURL = url_1.parse(url);
            url = routemap_1.Route.normalizeURL(url);
            let search = new search_1.AsyncRouteSearch();
            search.verb = verb;
            search.initial = () => __awaiter(this, void 0, void 0, function* () {
                const root = yield this.getRoot(parsedURL.hostname);
                let node = new search_1.AsyncRoutingState(root);
                node.left = url.length ? url.split("/") : [];
                return [node];
            });
            search.getPossibleRoutes = (from, next, rest) => __awaiter(this, void 0, void 0, function* () {
                let all = yield this.getRouteChildren(from);
                return all.filter((n) => n.match(next, rest));
            });
            let res = yield search.first();
            if (!res) {
                return { path: null, resource: null, uri: null, params: {} };
            }
            return {
                params: res.params,
                path: res.path,
                resource: yield this.getResource(res.data.data),
                uri: res.uri,
            };
        });
    }
}
exports.AsyncRouter = AsyncRouter;
//# sourceMappingURL=asyncRouter.js.map