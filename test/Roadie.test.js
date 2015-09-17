/** Roadie.test.js 
 *  Testes the roadie server, starting, page request
 */
"use strict";
var vows = require('vows'),
    assert = require('assert'),
	roadie = require("../"),
	path = require("path"),
	http = require("http"),
	$url = require("url");

var serv;
// process.on('uncaughtException', function(err) {
// 	console.log('Caught exception: ' + err.stack);
// });

function http_call(url, cb) {
	var o = $url.parse(url);
	o.method = "GET";
	var req = http.request(o, function(resp) {
		var str = "";

		var isDone = false;
		resp.setEncoding("utf8");
		resp.on("data", function(c) { str += c; });
		resp.on("error", function(err) { 
			if(isDone) return;
			isDone = true;
			cb(err, resp, null);
		});
		resp.on("end", function() { 
			if(isDone) return;
			isDone = true;
			cb(null, resp, str);
		});

	});
	req.end();
}

vows.describe("Roadie websererver").addBatch({
	"Webserver": {
		"start": function() {
			serv = new roadie.Server({port: 8080, webserviceDir: "webservices/", root: path.normalize(__dirname + "/../example/")  });
			serv.addRoutes(require("../example/routing.json"));
			serv.start();
		},
		"HalloWorld request": {
			topic: function() {
				http_call("http://localhost:8080/test/hallo/world", this.callback);
			},
			"result": function(err, resp, body) {
				if(err) throw err;
				assert.ok(
					resp.statusCode === 200
				 && body === "HalloWorld"
				);
			}
		},
		"Dead link": {
			topic: function() {
				http_call("http://localhost:8080/doesnt/exists", this.callback);
			},
			"result": function(err, resp, body) {
				if(err) throw err;
				assert.ok(
					resp.statusCode === 404
				);
			}
		},
		"Param request": {
			topic: function() {
				http_call("http://localhost:8080/test/testerrrr", this.callback);
			},
			"result": function(err, resp, body) {
				if(err) throw err;
				assert.ok(
					resp.statusCode === 200 
				 && body === "<h1>Below a list of your route params</h1>id: testerrrr<br />"
				);
			}
		},
		"Static file": {
			topic: function() {
				http_call("http://localhost:8080/statics/test.html", this.callback);
			},
			"result": function(err, resp, body) {
				if(err) throw err;
				var content = require("fs").readFileSync(path.normalize(__dirname + "/../example/statics/test.html"), { encoding: "utf8" });
				assert.ok(
					resp.statusCode === 200 
				 && body === content
				);
			}
		},
		teardown: function() {
			serv.stop();
		}
	}
	
}).export(module);