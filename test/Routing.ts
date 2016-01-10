"use strict";
import assert = require('assert');
import { HttpVerbs, RouteMap, StaticRoute, ParameterRoute, WildcardRoute } from "../routemap";

describe("Routing: ", () => {

    let Router: RouteMap;

    before(() => {
        Router = new RouteMap();
    });

    it("Adding route with parameter", () => {
        Router.addRoute("/test/{param}/", "param.js");
        
        assert.ok(
            Router.routes["test"] instanceof StaticRoute
                && Router.routes["test"].routes["{param}"] instanceof ParameterRoute
                && Router.routes["test"].routes["{param}"].name === "param"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.GET).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.POST).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.DELETE).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.PUT).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.OPTIONS).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.HEAD).script === "param.js"
                && Router.routes["test"].routes["{param}"].endpoints.get(HttpVerbs.TRACE).script === "param.js"
            );
    });

    //it("Specifing verb", () => {
    //    Router.addRoute("[GET]/test/", "get.js");

    //    assert.ok(
    //        Router.routes.test
    //        && Router.routes.test.resources.GET.script === "get.js"
    //    );
    //});

    //it("Searching route", () => {
    //    Router.addRoute("[POST]/url/{to}/search", "test.js");

    //    var res = Router.getRoute("/url/2/search", "POST");
    //    assert.ok(
    //        res
    //        && res.params.to === "2"
    //        && res.resource.script === "test.js"
    //    );
    //});

    //it("Searching wildcard route", () => {
    //    Router.addRoute("[GET]/url/to/search/*", "test.js");

    //    var res = Router.getRoute("/url/to/search/for", "GET");

    //    assert.ok(
    //        res
    //        && Object.keys(res.params).length === 0
    //        && res.resource.script === "test.js"
    //        && res.uri === "for"
    //    );
    //});

    //it("Getting custom data", () => {
    //    var cust_dat = { customProp: true, isTest: true };
    //    Router.addRoute("[GET]/my/custom/data", "test.js", cust_dat);

    //    var res = Router.getRoute("/my/custom/data", "GET");

    //    assert.ok(
    //        res
    //        && Object.keys(res.params).length === 0
    //        && res.resource.script === "test.js"
    //        && res.resource.data === cust_dat
    //    );
    //});

    //it("Setting function as script", () => {
    //    var fn = function (ctx) { };
    //    Router.addRoute("[GET]/my/custom/function", fn);

    //    var res = Router.getRoute("/my/custom/function", "GET");

    //    assert.ok(
    //        res
    //        && Object.keys(res.params).length === 0
    //        && res.resource.script === fn
    //        && res.resource.isFunction === true
    //    );
    //});

});
