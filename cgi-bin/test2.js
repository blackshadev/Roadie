var jnFunc = require("../jnServerFile.js");
var my_func = jnFunc(function() {
	this.setCookie("test", "testVal");
	console.log(this.client);
	return "test";
});
module.exports = my_func;