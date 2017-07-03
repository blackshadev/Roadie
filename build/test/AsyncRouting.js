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
const assert = require("assert");
const http_1 = require("../http");
const asyncRouteNode_1 = require("../routing/async/asyncRouteNode");
const asyncRouter_1 = require("../routing/async/asyncRouter");
const router_1 = require("../routing/router");
describe("AsyncRouter", () => {
    const routes = {
        "/": {
            "test": {
                "statics": {
                    "*.html": 12,
                },
                "test2": 5,
                "{prop}": -1,
            },
            "{er}": 1,
        },
    };
    it("Combined", () => __awaiter(this, void 0, void 0, function* () {
        let r = new asyncRouter_1.AsyncRouter();
        r.getRoot = () => __awaiter(this, void 0, void 0, function* () {
            return [new asyncRouteNode_1.AsyncRootNode({
                    data: routes["/"],
                })];
        });
        r.getResource = (d) => __awaiter(this, void 0, void 0, function* () {
            return d.data;
        });
        r.getRouteChildren = (n) => __awaiter(this, void 0, void 0, function* () {
            return Object.keys(n.data).map((k) => {
                const val = n.data[k];
                const leafs = typeof (val) === "number" ? http_1.HttpVerb.GET : 0;
                let type;
                if (k.indexOf("*") > -1) {
                    type = router_1.RouteType.wildcard;
                }
                else if (k[0] === "{") {
                    type = router_1.RouteType.parameter;
                    k = k.substr(1, k.length - 2);
                }
                else {
                    type = router_1.RouteType.static;
                }
                return asyncRouteNode_1.AsyncRouteNode.Create(type, {
                    data: val,
                    name: k,
                    leafs,
                });
            });
        });
        let res;
        res = yield r.getRoute("/test/test2", http_1.HttpVerb.GET);
        assert.equal(res.resource, 5);
        res = yield r.getRoute("/test/aaaaa", http_1.HttpVerb.GET);
        assert.equal(res.resource, -1);
        assert.equal(res.params.prop, "aaaaa");
        res = yield r.getRoute("/test/statics/index.html", http_1.HttpVerb.GET);
        assert.equal(res.resource, 12);
        assert.equal(res.uri, "index.html");
        res = yield r.getRoute("/test/statics/sub/dir/index.html", http_1.HttpVerb.GET);
        assert.equal(res.resource, 12);
        assert.equal(res.uri, "sub/dir/index.html");
        res = yield r.getRoute("/55/", http_1.HttpVerb.GET);
        assert.equal(res.resource, 1);
        assert.equal(res.params.er, "55");
        res = yield r.getRoute("/test/statics/index.js", http_1.HttpVerb.GET);
        assert.equal(res.resource, null);
        res = yield r.getRoute("/", http_1.HttpVerb.GET);
        assert.equal(res.resource, null);
        res = yield r.getRoute("/test/statics/index.html", http_1.HttpVerb.POST);
        assert.equal(res.resource, null);
    }));
});
//# sourceMappingURL=AsyncRouting.js.map