var $jn = require("./core.js");

$jn = (function($jn) {
	$jn.jnFunction = $jn.TObject.extends("jnFunction", {
		client: null,
		response: null,
		bodyFn: null,
		create: function(args) {
			this.response = new jnResponse();
		},
		exec: function(fn) {
			var res = fn.call(this);
			return { headers: this.response.headers(), data: res };
		},
		setCookie: function(key, value, args, flags) {
			this.response.addCookie(new $jn.TCookie(key, value, args, flags));
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
module.exports = function(bodyFn) {
	return function(args) { return new $jn.jnFunction(args).exec(bodyFn); };
};