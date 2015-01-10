var $j = require("../../roadie.js");

module.exports = $j.WebService.extend({
	view: function() {
		this.ctx.response.data("Tester<br />");
		this.ctx.response.append(this.ctx.request.parameters);
		this.ctx.response.send();
	},
    new: function() {
        this.ctx.response.data("<h1>Want a new Test?</h1>");
        this.ctx.response.send();
    },
	edit: function() {
        var id = this.ctx.request.parameters.id;
        this.ctx.response.header("Content-Type", "application/json")
        this.ctx.response.data(JSON.stringify({"type": "edit", "userid": id}));
        this.ctx.response.send();
    }
});


