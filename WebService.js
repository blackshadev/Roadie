/** WebService.js
 *  Author: Vincent Hagen
 *  
 *  General WebService implemetation
 */

module.exports = (function() {
	var o = require("./core.js");

    // Basic WebService, all webservices should extend this class 
	var WebService = o.Object.extend({
		ctx: null, // HttpContext 
		_method: null, // method name to call
		isReady: true, // Server will call the method by default
		create: function(ctx, method) { this.ctx = ctx; this._method = method; }
	});


	return { WebService: WebService };
})();