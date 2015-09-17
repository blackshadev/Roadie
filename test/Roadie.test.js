"use strict";
var vows = require('vows'),
    assert = require('assert'),
	roadie = require("../"),
	path = require("path"),
	request = require("request");

var serv;

vows.describe("Roadie websererver").addBatch({
	"Webserver": {
		"start": function() {
			serv = new roadie.Server({port: 8080, webserviceDir: "webservices/", root: path.normalize(__dirname + "/../example/")  });
			serv.addRoutes(require("../example/routing.json"));
			serv.start();
		},
		"HalloWorld request": {
			topic: function() {
				request("http://localhost:8080/test/hallo/world", this.callback);
			},
			"result": function(err, resp, body) {
				assert.ok(
					resp.statusCode === 200
				 && body === "HalloWorld"
				);
			}
		},
		"Dead link": {
			topic: function() {
				request("http://localhost:8080/doesnt/exists", this.callback);
			},
			"result": function(err, resp, body) {
				assert.ok(
					resp.statusCode === 404
				);
			}
		},
		teardown: function() {
			serv.stop();
		}
	}
	
}).export(module);