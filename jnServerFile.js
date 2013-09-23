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
 * var fn = require("../jnServerFile.js")(function() {
 *		this.setCookie("CookieKey","CookieValue");
 *		this.setHeader("Content-Type","text/html");
 *		var output = "<p>This will be displayed</p>";
 *		return output;
 * }); module.export = fn;
 *
 * Defaults:
 * - response::headers::Content-Type: text/html
 */
$jn = (function($jn) {
	$jn.jnFunction = $jn.TObject.extends("jnFunction", {
		client: null,
		response: null,
		bodyFn: null,
		create: function(args) {
			this.client = args;
			this.response = new jnResponse();
		},
		exec: function(fn) {
			var res = fn.call(this);
			return { headers: this.response.headers(), data: res };
		},
		setCookie: function(key, value, args, flags) {
			this.response.addCookie(new $jn.TCookie(key, value, args, flags));
		},
		setHeader: function(key, type) { // shortcut
			this.response.setHeader(key, type);
		}
	});

	$jn.TCookie = $jn.TObject.extends("TCookie", {
		key: "",
		value: "",
		args: null,
		flags: null,
		create: function(key, value, args, flags) {
			if(arguments.length  === 1) {
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