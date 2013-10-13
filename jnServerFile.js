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
		clientHeaders: null,
		response: null,
		bodyFn: null,
		streamPars: null,
		serverFile: null,
		content: null,
		create: function(serverFile, streamPars) {
			this.streamPars = streamPars;
			this.serverFile = serverFile;

			this.content = "";
			this.clientHeaders = new jnClient(serverFile.serverRequest);
			this.response = new jnResponse();
		},
		setCookie: function(key, value, args, flags) {
			return this.response.addCookie(new $jn.TCookie(key, value, args, flags));
		},
		setHeader: function(key, type) { // shortcut
			this.response.setHeader(key, type);
		},
		getClientHeaders: function() {
			return this.clientHeaders;
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
			// console.log("dataSend: " + this.content);
			this.streamPars.data(this.content);
		}
	});
/*
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
	});*/
	
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
				setHeader: function(key,val) { return self.setHeader(key, val);},
				setCookie: function(key,val, args, flags) {
					return self.setCookie(key, val, args, flags);
				},
				getClientHeaders: function() { return self.getClientHeaders(); },
				send: function() { return self.send(); },
				require: require
			};
			var context = self.vm.createContext();
			$jn.extend(context, sandbox);
			/* Files can be cached (compiled once and stored in a Script object) */
			self.fs.readFile(self.serverFile.fullName, function (err, data) {
				try {
					if (err) throw err;
					self.vm.runInNewContext(data, context);
				} catch (e) {
					self.content += e.toString();
				}
				self.send();
			});
			// var stream = this.fs.createReadStream(this.serverFile.fullName);
			// var filecontent = "";
			// stream.on("data", function(dat) { filecontent += dat; });
			// stream.on("end", function() { self.send(); })
		}
	});

	$jn.TCookie = $jn.TObject.extends("TCookie", {
		key: "",
		value: "",
		args: null,
		flags: null,
		create: function(key, value, args, flags) {
			if(arguments.length === 1) {
				// console.log("Cookie should be parsed: " + key);
			}
			this.key = key;
			this.value = value;
			this.args = args || {};
			this.flags = flags || [];

		},
		toString: function() {
			var out = this.key + "=" + this.value;
			for(var key in this.args)
				out += "; " + key + "=" + this.args[key];
			for(var iX = 0; iX < this.flags.length; iX++)
				out += "; " + this.flags[iX];
			return out;
		},
		setLifeTime: function(val) {
			var parseTime = function(key) {
				var m = new RegExp('\\s*(-?\\s*\\d+)\\s*' + key + '(s)?','i').exec(val);
				return m? parseFloat(m[1].trim(),10) : 0;
			};
			var toTime = function(obj) {
				return obj.sec * 1000 +
				obj.min * 60000 +
				obj.hour * 3600000 +
				obj.day * 86400000 +
				obj.week * 604800000 +
				obj.month * 2592000000 +
				obj.year * 31557600000;
			};
			var res = {
				sec: parseTime("sec(ond)?"),
				min: parseTime("min(ute)?"),
				hour: parseTime("hour"),
				day: parseTime("day"),
				week: parseTime("week"),
				month: parseTime("month"),
				year: parseTime("year")
			};
			var date = new Date();
			date.setTime(date.getTime() + toTime(res));
			this.setArg("Expires", date.toUTCString());
			return date;
		},
		setArg: function(key, val) {
			this.args[key] = val;
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
			return cookie;
		}
	});

	var jnClient = $jn.TObject.extends("jnClient", {
		headers: null,
		create: function(serverRequest) {
			this.headers = serverRequest.getDynamicHeaders();
		},
		toString: function() {
			return objToString(this.headers);
		}
	});

	function objToString(obj) {
		var str = "";
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				if(typeof(obj[p]) === "object")
					str += p + ': {<br />' + objToString(obj[p]) + '<br />},<br />';
				else
					str += p + ': ' + obj[p] + '<br />';
			}
		}
		return str;
	}

	return $jn;
})($jn);
module.exports = $jn.jnFunction;