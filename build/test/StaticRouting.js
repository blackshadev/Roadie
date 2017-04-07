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
const endpoints_1 = require("../endpoints");
const routemap_1 = require("../routing/static/routemap");
const http_1 = require("../http");
describe("Static routing: ", () => {
    let router;
    before(() => {
        router = new routemap_1.StaticRouter();
    });
    it("Adding route with parameter", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("/test/{param}/", endpoints_1.Endpoint.Create("param.js"));
        assert.ok(router.routes.test instanceof routemap_1.StaticRoute
            && router.routes.test.routes["{param}"] instanceof routemap_1.ParameterRoute
            && router.routes.test.routes["{param}"].name === "param"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.GET).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.POST).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.DELETE).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.PUT).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.OPTIONS).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.HEAD).script === "param.js"
            && router.routes.test.routes["{param}"].endpoints.get(http_1.HttpVerb.TRACE).script === "param.js");
    }));
    it("Specifing verb", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[GET]/test/", endpoints_1.Endpoint.Create("get.js"));
        assert.ok(router.routes.test
            && router.routes.test.endpoints.get(http_1.HttpVerb.GET).script === "get.js"
            && router.routes.test.endpoints.get(http_1.HttpVerb.POST) === undefined);
    }));
    it("Searching route", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[POST]/url/{to}/search", endpoints_1.Endpoint.Create("test.js"));
        const res = yield router.getRoute("/url/2/search", http_1.HttpVerb.POST);
        assert.ok(res
            && res.params.to === "2"
            && res.resource.script === "test.js");
    }));
    it("Multiple verbs", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[POST,PUT,DELETE]/a/static/url", endpoints_1.Endpoint.Create("poster.js"));
        let res = yield router.getRoute("/a/static/url", http_1.HttpVerb.POST);
        assert.ok(res && res.resource.script === "poster.js", "Didn't match the correct route");
        res = yield router.getRoute("/a/static/url", http_1.HttpVerb.GET);
        assert.ok(!res.resource, "Matched a route while expecting it to not match");
    }));
    it("Searching wildcard route", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[GET]/url/to/search/*", endpoints_1.Endpoint.Create("test.js"));
        const res = yield router.getRoute("/url/to/search/for", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.uri === "for");
    }));
    it("Getting custom data", () => __awaiter(this, void 0, void 0, function* () {
        const custDat = { customProp: true, isTest: true };
        yield router.addRoute("[GET]/my/custom/data", endpoints_1.Endpoint.Create("test.js", custDat));
        const res = yield router.getRoute("/my/custom/data", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.resource.data === custDat);
    }));
    it("Setting function as script", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (ctx) => { };
        yield router.addRoute("[GET]/my/custom/function", endpoints_1.Endpoint.Create(fn));
        const res = yield router.getRoute("/my/custom/function", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === fn);
    }));
    it("Search precidence", () => __awaiter(this, void 0, void 0, function* () {
        router.addRoute("[PUT]/some/{a}/{b}", endpoints_1.Endpoint.Create("1"));
        router.addRoute("[PUT]/some/{a}/url", endpoints_1.Endpoint.Create("2"));
        router.addRoute("[PUT]/some/custom/url", endpoints_1.Endpoint.Create("3"));
        let res = yield router.getRoute("/some/custom/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "3", "Static precidence failt");
        res = yield router.getRoute("/some/B/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "2" && res.params.a === "b");
        res = yield router.getRoute("/some/custom/A", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "1" && res.params.a === "custom" && res.params.b === "a");
    }));
    it("With hostname", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[GET]github.com/blackshadev/Roadie/", endpoints_1.Endpoint.Create("test.js"));
        const res = yield router.getRoute("github.com/blackshadev/Roadie/", http_1.HttpVerb.GET);
        assert.ok(res
            && res.resource.script === "test.js");
    }));
    it("With Parameter subdomain", () => __awaiter(this, void 0, void 0, function* () {
        router.addRoute("[GET]{sub}.littledev.nl", endpoints_1.Endpoint.Create("test.js"));
        const res = yield router.getRoute("tester.littledev.nl", http_1.HttpVerb.GET);
        assert.ok(res, "Expected to find route");
        assert.equal(res.params.sub, "tester", "Invalid parameter");
        assert.equal(res.resource.script, "test.js", "Invalid bind resource");
    }));
    it("URL normalization", () => __awaiter(this, void 0, void 0, function* () {
        yield router.addRoute("[GET]///test//test//////{aaa}////", endpoints_1.Endpoint.Create("test.js"));
        const res = yield router.getRoute("test/test/tester/", http_1.HttpVerb.GET);
        assert.ok(res, "Expected to find route");
        assert.equal(res.params.aaa, "tester", "Invalid parameter");
        assert.equal(res.resource.script, "test.js", "Invalid bind resource");
    }));
});
//# sourceMappingURL=StaticRouting.js.map