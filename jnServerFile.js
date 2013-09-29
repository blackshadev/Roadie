var $jn = require("./core.js");
/**
 * Wrapper for dynamic files. This class makes dynamic files easy to handle,
 *
 * Features:
 * - Client header parsing
 * - Easy accessing of clientHeaders, response Headers, and output
 * - Output given by the return value of the given function
 *
 * Usage:
 * module.exports = function() {
 *		this.print("testje");
 *		this.send();	
 * }
 * 
 *
 * Defaults:
 * - response::headers::Content-Type: text/html
 */
$jn = (function($jn) {
	$jn.jnAbstract = $jn.TObject.extends("jnAbstract", {
		client: null,
		response: null,
		bodyFn: null,
		streamPars: null,
		serverFile: null,
		content: null,
		create: function(serverFile, streamPars) {
			this.streamPars = streamPars;
			this.client = serverFile.serverRequest.getDynamicHeaders();
			this.serverFile = serverFile;

			this.content = "";
			this.response = new jnResponse();
		},
		setCookie: function(key, value, args, flags) {
			this.response.addCookie(new $jn.TCookie(key, value, args, flags));
		},
		setHeader: function(key, type) { // shortcut
			this.response.setHeader(key, type);
		},
		send: function() {
			this.sendHeaders();
			this.sendContent();
			this.streamPars.end(true);
		},
		sendHeaders: function() {
			var headers = this.response.headers();
			var respHeader = this.serverFile.serverRequest.respHeader;
			for(var key in headers)
				respHeader.headers[key] = headers[key];
			this.serverFile.length = this.content.length;
			this.serverFile.mimeType = 
				respHeader.headers["Content-Type"] || "text/html";

			this.streamPars.start(true);
		},
		sendContent: function() {
			console.log("dataSend: " + this.content);
			this.streamPars.data(this.content);
		}
	});

	$jn.jnFunction = $jn.jnAbstract.extends("jnFunction", {
		fn: null,
		create: function() {
			this.inherited().create.apply(this, arguments);
			this.fn = require(this.serverFile.fullName);
			if(typeof this.fn !== "function")
				throw "Expected function, " + typeof this.fn + " given";
		},
		exec: function() {
			var res = this.fn.call(this);
		},
		print: function(str) {
			this.content += str;
		}
	});

	$jn.jnFile = $jn.jnAbstract.extends("jnFile", {
		fileName: "",
		cp: require('child_process'),
		child: 0,
		create: function() {
			this.inherited().create.apply(this, arguments);
			this.fileName = this.serverFile.fullName;
		},
		exec: function() {
			var self = this;
			var testVar = "test";
			this.child = this.cp.spawn("node",[this.fileName],{
				
				stdio: ['ignore', null, null]
			});
			this.child.stdout.on("data", function(data) {
				self.content += data;
			});
			this.child.stderr.on("data", function(err) {
				self.content += err.toString();
			});
			this.child.on("exit", function() {
				self.send();
			});
		}
	});
	
	$jn.jnScript = $jn.jnAbstract.extends("jnScript", {
		fs: require('fs'),
		vm: require('vm'),
		create: function() {
			this.inherited().create.apply(this, arguments);
		},
		exec: function() {
			var self = this;
			var sandbox = {
				/* Globally scoped variables */
				print: function(data) {
					self.content += data;
				},
				send: self.send
			};
			/* Files can be cached (compiled once and stored in a Script object) */
			fs.readFile(self.serverFile.fullName, function (err, data) {
				try {
					if (err) throw err;
					vm.runInNewContext(data, sandbox);
				} catch (e) {
					self.content += e.toString();
				}
				self.send();
			});
		}
	});

	$jn.TCookie = $jn.TObject.extends("TCookie", {
		key: "",
		value: "",
		args: null,
		flags: null,
		create: function(key, value, args, flags) {
			if(arguments.length === 1) {
				console.log("Cookie should be parsed: " + key);
			}
			this.key = key;
			this.value = value;
			this.args = args || {};
			this.flags = flags || [];

		},
		toString: function() {
			var out = this.key + "=" + this.value;
			for(var key in this.args)
				out += "; " + key + ":" + this.args[key];
			for(var iX = 0; iX < this.flags.length; iX++)
				out += "; " + this.flags[iX];
			return out;
		}
	});

	var jnResponse = $jn.TObject.extends("jnResponse", {
		headerObj: null,
		cookies: null,
		create: function() {
			this.headerObj = {};
			this.cookies = {};
			this.setHeader("Content-Type","text/html");
		},
		headers: function() {
			var obj = $jn.extend({}, this.headerObj);
			obj["Set-Cookie"] = [];
			for( var key in this.cookies)
				obj["Set-Cookie"].push(this.cookies[key].toString());
			return obj;
		},
		setHeader: function(type, value) {
			this.headerObj[type] = value;
		},
		addCookie: function(cookie) {
			this.cookies[cookie.key] = cookie;
		}
	});
	return $jn;
})($jn);
module.exports = $jn.jnFunction;