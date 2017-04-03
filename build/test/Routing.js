"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const endpoints_1 = require("../endpoints");
const routemap_1 = require("../routemap");
const http_1 = require("../http");
describe("Routing: ", () => {
    let router;
    before(() => {
        router = new routemap_1.RouteMap();
    });
    it("Adding route with parameter", () => {
        router.addRoute("/test/{param}/", endpoints_1.Endpoint.Create("param.js"));
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
    });
    it("Specifing verb", () => {
        router.addRoute("[GET]/test/", endpoints_1.Endpoint.Create("get.js"));
        assert.ok(router.routes.test
            && router.routes.test.endpoints.get(http_1.HttpVerb.GET).script === "get.js"
            && router.routes.test.endpoints.get(http_1.HttpVerb.POST) === undefined);
    });
    it("Searching route", () => {
        router.addRoute("[POST]/url/{to}/search", endpoints_1.Endpoint.Create("test.js"));
        let res = router.getRoute("/url/2/search", http_1.HttpVerb.POST);
        assert.ok(res
            && res.params.to === "2"
            && res.resource.script === "test.js");
    });
    it("Multiple verbs", () => {
        router.addRoute("[POST,PUT,DELETE]/a/static/url", endpoints_1.Endpoint.Create("poster.js"));
        let res = router.getRoute("/a/static/url", http_1.HttpVerb.POST);
        assert.ok(res && res.resource.script === "poster.js", "Didn't match the correct route");
        res = router.getRoute("/a/static/url", http_1.HttpVerb.GET);
        assert.ok(!res.resource, "Matched a route while expecting it to not match");
    });
    it("Searching wildcard route", () => {
        router.addRoute("[GET]/url/to/search/*", endpoints_1.Endpoint.Create("test.js"));
        let res = router.getRoute("/url/to/search/for", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.uri === "for");
    });
    it("Getting custom data", () => {
        let custDat = { customProp: true, isTest: true };
        router.addRoute("[GET]/my/custom/data", endpoints_1.Endpoint.Create("test.js", custDat));
        let res = router.getRoute("/my/custom/data", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.resource.data === custDat);
    });
    it("Setting function as script", () => {
        let fn = (ctx) => { };
        router.addRoute("[GET]/my/custom/function", endpoints_1.Endpoint.Create(fn));
        let res = router.getRoute("/my/custom/function", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === fn);
    });
    it("Search precidence", () => {
        router.addRoute("[PUT]/some/{a}/{b}", endpoints_1.Endpoint.Create("1"));
        router.addRoute("[PUT]/some/{a}/url", endpoints_1.Endpoint.Create("2"));
        router.addRoute("[PUT]/some/custom/url", endpoints_1.Endpoint.Create("3"));
        let res = router.getRoute("/some/custom/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "3", "Static precidence failt");
        res = router.getRoute("/some/B/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "2" && res.params.a === "b");
        res = router.getRoute("/some/custom/A", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "1" && res.params.a === "custom" && res.params.b === "a");
    });
    it("With hostname", () => {
        router.addRoute("[GET]github.com/blackshadev/Roadie/", endpoints_1.Endpoint.Create("test.js"));
        let res = router.getRoute("github.com/blackshadev/Roadie/", http_1.HttpVerb.GET);
        assert.ok(res
            && res.resource.script === "test.js");
    });
    it("With Parameter subdomain", () => {
        router.addRoute("[GET]{sub}.littledev.nl", endpoints_1.Endpoint.Create("test.js"));
        let res = router.getRoute("tester.littledev.nl", http_1.HttpVerb.GET);
        assert.ok(res, "Expected to find route");
        assert.equal(res.params.sub, "tester", "Invalid parameter");
        assert.equal(res.resource.script, "test.js", "Invalid bind resource");
    });
    it("URL normalization", () => {
        router.addRoute("[GET]///test//test//////{aaa}////", endpoints_1.Endpoint.Create("test.js"));
        let res = router.getRoute("test/test/tester/", http_1.HttpVerb.GET);
        assert.ok(res, "Expected to find route");
        assert.equal(res.params.aaa, "tester", "Invalid parameter");
        assert.equal(res.resource.script, "test.js", "Invalid bind resource");
    });
});
//# sourceMappingURL=Routing.js.map