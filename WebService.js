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
		create: function(ctx) { this.ctx = ctx; }
	});


	return { WebService: WebService };
})();