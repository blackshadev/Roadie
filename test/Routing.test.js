/** Routing.test.js 
 *  Testes the functionallity of the routing system
 */

"use strict";
var vows = require('vows'),
    assert = require('assert'),
	Routing = require("../Routing.js");

vows.describe("Routemap").addBatch({
	"Routemap": {
		topic: new Routing.RouteMap(),
		"Adding route with parameter": function(Router) {
			Router.addRoute("/test/{param}/", "param.js");
		
			assert.ok(
				Router.routes.test 
			 && Router.routes.test.routes["{param}"] 
			 && Router.routes.test.routes["{param}"].isParameter
			 && Router.routes.test.routes["{param}"].parameter === "param"
			 && Router.routes.test.routes["{param}"].resources.GET.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.POST.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.DELETE.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.PUT.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.OPTIONS.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.HEAD.script === "param.js"
			 && Router.routes.test.routes["{param}"].resources.TRACE.script === "param.js"
			);
		},
		"Specifing verb": function(Router) {
			Router.addRoute("[GET]/test/", "get.js");
		
			assert.ok(
				Router.routes.test
			 && Router.routes.test.resources.GET.script === "get.js"
			);
		},
		"Searching route": function(Router) {
			Router.addRoute("[POST]/url/{to}/search", "test.js");	

			var res = Router.getRoute("/url/2/search", "POST");
			assert.ok(
				res
			 && res.params.to === "2"
			 && res.resource.script === "test.js"	
			);
		},
		"Searching wildcard route": function(Router) {
			Router.addRoute("[GET]/url/to/search/*", "test.js");	

			var res = Router.getRoute("/url/to/search/for", "GET");

			assert.ok(
				res
			 && Object.keys(res.params).length === 0
			 && res.resource.script === "test.js"	
			 && res.uri === "for"
			);
		},
		"Getting custom data": function(Router) {
			var cust_dat = { customProp: true, isTest: true };
			Router.addRoute("[GET]/my/custom/data", "test.js", cust_dat);	

			var res = Router.getRoute("/my/custom/data", "GET");

			assert.ok(
				res
			 && Object.keys(res.params).length === 0
			 && res.resource.script === "test.js"	
			 && res.resource.data === cust_dat
			);	
		},
		"Setting function as script": function(Router) {
			var fn = function(ctx) {};
			Router.addRoute("[GET]/my/custom/function", fn);	

			var res = Router.getRoute("/my/custom/function", "GET");

			assert.ok(
				res
			 && Object.keys(res.params).length === 0
			 && res.resource.script === fn
			 && res.resource.isFunction === true
			);	
		}
	}

}).export(module);