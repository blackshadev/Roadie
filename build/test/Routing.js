"use strict";
const assert = require("assert");
const routemap_1 = require("../routemap");
const endpoints_1 = require("../endpoints");
const http_1 = require("../http");
describe("Routing: ", () => {
    let Router;
    before(() => {
        Router = new routemap_1.RouteMap();
    });
    it("Adding route with parameter", () => {
        Router.addRoute("/test/{param}/", endpoints_1.Endpoint.Create("param.js"));
        assert.ok(Router.routes["test"] instanceof routemap_1.StaticRoute
            && Router.routes["test"].routes["{param}"] instanceof routemap_1.ParameterRoute
            && Router.routes["test"].routes["{param}"].name === "param"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.GET).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.POST).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.DELETE).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.PUT).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.OPTIONS).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.HEAD).script === "param.js"
            && Router.routes["test"].routes["{param}"].endpoints.get(http_1.HttpVerb.TRACE).script === "param.js");
    });
    it("Specifing verb", () => {
        Router.addRoute("[GET]/test/", endpoints_1.Endpoint.Create("get.js"));
        assert.ok(Router.routes['test']
            && Router.routes['test'].endpoints.get(http_1.HttpVerb.GET).script === "get.js"
            && Router.routes['test'].endpoints.get(http_1.HttpVerb.POST) === undefined);
    });
    it("Searching route", () => {
        Router.addRoute("[POST]/url/{to}/search", endpoints_1.Endpoint.Create("test.js"));
        var res = Router.getRoute("/url/2/search", http_1.HttpVerb.POST);
        assert.ok(res
            && res.params["to"] === "2"
            && res.resource.script === "test.js");
    });
    it("Multiple verbs", () => {
        Router.addRoute("[POST,PUT,DELETE]/a/static/url", endpoints_1.Endpoint.Create("poster.js"));
        let res = Router.getRoute("/a/static/url", http_1.HttpVerb.POST);
        assert.ok(res && res.resource.script === "poster.js", "Didn't match the correct route");
        res = Router.getRoute("/a/static/url", http_1.HttpVerb.GET);
        assert.ok(!res.resource, "Matched a route while expecting it to not match");
    });
    it("Searching wildcard route", () => {
        Router.addRoute("[GET]/url/to/search/*", endpoints_1.Endpoint.Create("test.js"));
        var res = Router.getRoute("/url/to/search/for", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.uri === "for");
    });
    it("Getting custom data", () => {
        var cust_dat = { customProp: true, isTest: true };
        Router.addRoute("[GET]/my/custom/data", endpoints_1.Endpoint.Create("test.js", cust_dat));
        var res = Router.getRoute("/my/custom/data", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.resource.data === cust_dat);
    });
    it("Setting function as script", () => {
        var fn = function (ctx) { };
        Router.addRoute("[GET]/my/custom/function", endpoints_1.Endpoint.Create(fn));
        var res = Router.getRoute("/my/custom/function", http_1.HttpVerb.GET);
        assert.ok(res
            && Object.keys(res.params).length === 0
            && res.resource.script === fn);
    });
    it("Search precidence", () => {
        Router.addRoute("[PUT]/some/{a}/{b}", endpoints_1.Endpoint.Create("1"));
        Router.addRoute("[PUT]/some/{a}/url", endpoints_1.Endpoint.Create("2"));
        Router.addRoute("[PUT]/some/custom/url", endpoints_1.Endpoint.Create("3"));
        let res = Router.getRoute("/some/custom/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "3", "Static precidence failt");
        res = Router.getRoute("/some/B/url", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "2" && res.params["a"] === "b");
        res = Router.getRoute("/some/custom/A", http_1.HttpVerb.PUT);
        assert.ok(res && res.resource.script === "1" && res.params["a"] === "custom" && res.params["b"] === "a");
    });
});
//# sourceMappingURL=Routing.js.map