var $jn = require("../core.js").$jn;
$jn = (function($jn) {
	

	$jn.jnFunction = $jn.TObject.extends("jnFunction", {
		client: null,
		response: null,
		bodyFn: null,
		create: function(args) {
			/* set server args */
			this.response = new jnResponse(/*..*/);
		},
		exec: function(fn) {
			var res = fn.call(this);
			/*	Takes the output and returns it as 
				{ headers: headers , data: out };
				and somewhere needs the cookies to be stored
				*/
			return { headers: this.response.headers(), data: res };
		},
		setCookie: function(key, value, args, flags) {
			/* sets a cookie in response.cookies */
		}
	});

	var jnResponse = $jn.TObject.extends("jnResponse", {
		headerObj: null,
		cookies: null,
		create: function() {
			this.headerObj = {};
			this.cookies = [];
			this.setHeader("Content-Type","text/html");
		},
		headers: function() { return this.headerObj; },
		setHeader: function(type, value) {
			this.headerObj[type] = value;
		}
	});

	var jnCookie = $jn.TObject.extends("jnCookie", {
		key: "",
		value: "",
		args: null,
		flags: null,
		create: function(key, value, args, flags) {
			this.key = key;
			this.value = value;
			this.args = args || {};
			this.flags = flags || [];
		},
		toString: function() {
			out = "Set-Cookie: " + this.key + "=" + this.value;
			for(var key in args)
				out += "; " + key + ":" + args[key];
			for(var iX = 0; iX < this.flags.length; iX++)
				out += "; " + this.flags[iX];
		}
	});

	return $jn;
})($jn);
module.exports = function(bodyFn) {
	return function(args) { return new $jn.jnFunction(args).exec(bodyFn); };
};