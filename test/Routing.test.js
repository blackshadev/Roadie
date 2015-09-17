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
			 && Router.routes.test.routes["{param}"].resources.GET === "param.js"
			 && Router.routes.test.routes["{param}"].resources.POST === "param.js"
			 && Router.routes.test.routes["{param}"].resources.DELETE === "param.js"
			 && Router.routes.test.routes["{param}"].resources.PUT === "param.js"
			 && Router.routes.test.routes["{param}"].resources.OPTIONS === "param.js"
			 && Router.routes.test.routes["{param}"].resources.HEAD === "param.js"
			 && Router.routes.test.routes["{param}"].resources.TRACE === "param.js"
			);
		},
		"Specifing verb": function(Router) {
			Router.addRoute("[GET]/test/", "get.js");
		
			assert.ok(
				Router.routes.test
			 && Router.routes.test.resources.GET === "get.js"
			);
		},
		"Searching route": function(Router) {
			Router.addRoute("[POST]/url/{to}/search", "test.js");	

			var res = Router.getRoute("/url/2/search", "POST");
			assert.ok(
				res
			 && res.params.to === "2"
			 && res.resource === "test.js"	
			);
		},
		"Searching wildcard route": function(Router) {
			Router.addRoute("[GET]/url/to/search/*", "test.js");	

			var res = Router.getRoute("/url/to/search/for", "GET");

			assert.ok(
				res
			 && Object.keys(res.params).length === 0
			 && res.resource === "test.js"	
			 && res.uri === "for"
			);
		}
	}

}).export(module);