var jnFunc = require("../jnServerFile.js");
var my_func = jnFunc(function() {
	this.setCookie("test", "testVal");
	this.setCookie("test2", new Date().toString());
	this.setCookie("test3", new Date().valueOf());

	return "test";
});
module.exports = my_func;