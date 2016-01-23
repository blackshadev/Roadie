"use strict";
import assert = require('assert');
import { RouteMap, StaticRoute, ParameterRoute, WildcardRoute } from "../routemap";
import { Endpoint } from "../endpoints";

import { HttpVerb } from "../http";

describe("Routing: ", () => {

    let Router: RouteMap;

    before(() => {
        Router = new RouteMap();
    });

    it("Adding route with parameter", () => {
        Router.addRoute("/test/{param}/", Endpoint.Create("param.js"));
        
        assert.ok(
            Router.routes["test"] instanceof StaticRoute
                && Router.routes["test"].routes["{param}"] instanceof ParameterRoute
                && Router.routes["test"].routes["{param}"].name === "param"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.GET).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.POST).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.DELETE).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.PUT).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.OPTIONS).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.HEAD).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerb.TRACE).script === "param.js"
            );
    });

    it("Specifing verb", () => {
        Router.addRoute("[GET]/test/", Endpoint.Create("get.js"));

        assert.ok(
            Router.routes['test']
            && Router.routes['test'].endpoints.get(HttpVerb.GET).script === "get.js"
            && Router.routes['test'].endpoints.get(HttpVerb.POST) === undefined
        );
    });

    it("Searching route", () => {
        Router.addRoute("[POST]/url/{to}/search", Endpoint.Create("test.js"));

        var res = Router.getRoute("/url/2/search", HttpVerb.POST);
        assert.ok(
            res
            && res.params["to"] === "2"
            && res.resource.script === "test.js"
        );
    });

    it("Multiple verbs", () => {
        Router.addRoute("[POST,PUT,DELETE]/a/static/url", Endpoint.Create("poster.js"));
        let res = Router.getRoute("/a/static/url", HttpVerb.POST);
        assert.ok(
            res && res.resource.script === "poster.js",
            "Didn't match the correct route"
        );

        res = Router.getRoute("/a/static/url", HttpVerb.GET);
        assert.ok(!res.resource, "Matched a route while expecting it to not match");
    });

    it("Searching wildcard route", () => {
        Router.addRoute("[GET]/url/to/search/*", Endpoint.Create("test.js"));

        var res = Router.getRoute("/url/to/search/for", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.uri === "for"
        );
    });

    it("Getting custom data", () => {
        var cust_dat = { customProp: true, isTest: true };
        Router.addRoute("[GET]/my/custom/data", Endpoint.Create("test.js", cust_dat));

        var res = Router.getRoute("/my/custom/data", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.resource.data === cust_dat
        );
    });

    it("Setting function as script", () => {
        var fn = function (ctx) { };
        Router.addRoute("[GET]/my/custom/function", Endpoint.Create(fn));

        var res = Router.getRoute("/my/custom/function", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === fn
        );
    });

    it("Search precidence", () => {
        Router.addRoute("[PUT]/some/{a}/{b}", Endpoint.Create("1"));
        Router.addRoute("[PUT]/some/{a}/url", Endpoint.Create("2"));
        Router.addRoute("[PUT]/some/custom/url", Endpoint.Create("3"));

        let res = Router.getRoute("/some/custom/url", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "3", "Static precidence failt");

        res = Router.getRoute("/some/B/url", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "2" && res.params["a"] === "b");

        res = Router.getRoute("/some/custom/A", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "1" && res.params["a"] === "custom" && res.params["b"] === "a");
        

    });

});
