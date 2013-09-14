var $jn = require("../core.js").$jn;
$jn = (function($jn) {
	

	$jn.jnFunction = $jn.TObject.extends("jnFunction", {
		client: null,
		response: null,
		bodyFn: null,
		create: function(args) {
			/* set server args */
		},
		exec: function(fn) {
			fn.call(this);
			/*	Takes the output and returns it as 
				{ headers: headers , data: out };
				and somewhere needs the cookies to be stored
				*/

		},
		setCookie: function(key, value, args, flags) {
			/* sets a cookie in response.cookies */
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

	
})($jn);
module.exports = function(bodyFn) {
	return function(args) { new $jn.jnFunction(args).exec(bodyFn); };
};