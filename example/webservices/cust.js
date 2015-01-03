var $j = require("../../junction.js");

module.exports = $j.WebService.extend({
	view: function() {
		this.ctx.response.data("Tester<br />");
		this.ctx.response.append(this.ctx.request.parameters);
		this.ctx.response.send();
	},
	admin: function() {
		this.ctx.send();
	}
});


