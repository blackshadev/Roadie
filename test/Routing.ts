"use strict";
import assert = require("assert");
import { Endpoint } from "../endpoints";
import { ParameterRoute, RouteMap, StaticRoute, WildcardRoute } from "../routemap";

import { HttpVerb } from "../http";

describe("Routing: ", () => {

    let router: RouteMap;

    before(() => {
        router = new RouteMap();
    });

    it("Adding route with parameter", () => {
        router.addRoute("/test/{param}/", Endpoint.Create("param.js"));

        assert.ok(
            router.routes.test instanceof StaticRoute
                && router.routes.test.routes["{param}"] instanceof ParameterRoute
                && router.routes.test.routes["{param}"].name === "param"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.GET).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.POST).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.DELETE).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.PUT).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.OPTIONS).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.HEAD).script === "param.js"
                && router.routes.test.routes["{param}"].endpoints.get(HttpVerb.TRACE).script === "param.js",
            );
    });

    it("Specifing verb", () => {
        router.addRoute("[GET]/test/", Endpoint.Create("get.js"));

        assert.ok(
            router.routes.test
            && router.routes.test.endpoints.get(HttpVerb.GET).script === "get.js"
            && router.routes.test.endpoints.get(HttpVerb.POST) === undefined,
        );
    });

    it("Searching route", () => {
        router.addRoute("[POST]/url/{to}/search", Endpoint.Create("test.js"));

        let res = router.getRoute("/url/2/search", HttpVerb.POST);
        assert.ok(
            res
            && res.params.to === "2"
            && res.resource.script === "test.js",
        );
    });

    it("Multiple verbs", () => {
        router.addRoute("[POST,PUT,DELETE]/a/static/url", Endpoint.Create("poster.js"));
        let res = router.getRoute("/a/static/url", HttpVerb.POST);
        assert.ok(
            res && res.resource.script === "poster.js",
            "Didn't match the correct route",
        );

        res = router.getRoute("/a/static/url", HttpVerb.GET);
        assert.ok(!res.resource, "Matched a route while expecting it to not match");
    });

    it("Searching wildcard route", () => {
        router.addRoute("[GET]/url/to/search/*", Endpoint.Create("test.js"));

        let res = router.getRoute("/url/to/search/for", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.uri === "for",
        );
    });

    it("Getting custom data", () => {
        let custDat = { customProp: true, isTest: true };
        router.addRoute("[GET]/my/custom/data", Endpoint.Create("test.js", custDat));

        let res = router.getRoute("/my/custom/data", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === "test.js"
            && res.resource.data === custDat,
        );
    });

    it("Setting function as script", () => {
        let fn = (ctx) => {/*NOOP*/};
        router.addRoute("[GET]/my/custom/function", Endpoint.Create(fn));

        let res = router.getRoute("/my/custom/function", HttpVerb.GET);

        assert.ok(
            res
            && Object.keys(res.params).length === 0
            && res.resource.script === fn,
        );
    });

    it("Search precidence", () => {
        router.addRoute("[PUT]/some/{a}/{b}", Endpoint.Create("1"));
        router.addRoute("[PUT]/some/{a}/url", Endpoint.Create("2"));
        router.addRoute("[PUT]/some/custom/url", Endpoint.Create("3"));

        let res = router.getRoute("/some/custom/url", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "3", "Static precidence failt");

        res = router.getRoute("/some/B/url", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "2" && res.params.a === "b");

        res = router.getRoute("/some/custom/A", HttpVerb.PUT);
        assert.ok(res && res.resource.script === "1" && res.params.a === "custom" && res.params.b === "a");

    });

    it("With hostname", () => {
        router.addRoute("[GET]github.com/blackshadev/Roadie/", Endpoint.Create("test.js"));

        let res = router.getRoute("github.com/blackshadev/Roadie/", HttpVerb.GET);
        assert.ok(
            res
            && res.resource.script === "test.js",
        );
    });

    it("With Parameter subdomain", () => {
        router.addRoute("[GET]{sub}.littledev.nl", Endpoint.Create("test.js"));

        let res = router.getRoute("tester.littledev.nl", HttpVerb.GET);
        assert.ok(
            res
            && res.params.sub === "tester"
            && res.resource.script === "test.js",
        );
    });

});
