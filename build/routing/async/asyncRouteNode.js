"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../router");
const routemap_1 = require("../static/routemap");
class AsyncRouteNode {
    constructor(oPar = {}) {
        this.type = router_1.RouteType.unknown;
        this.name = oPar.name || "";
        this.data = oPar.data;
        this.leafs = oPar.leafs || 0;
    }
    static Create(type, oPar) {
        switch (type) {
            case router_1.RouteType.parameter: return new AsyncParameterNode(oPar);
            case router_1.RouteType.root: return new AsyncRootNode(oPar);
            case router_1.RouteType.static: return new AsyncStaticNode(oPar);
            case router_1.RouteType.wildcard: return new AsyncWildcardNode(oPar);
            default: throw new Error("No such RouteType found");
        }
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
//# sourceMappingURL=asyncRouteNode.js.map