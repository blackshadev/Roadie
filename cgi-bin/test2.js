var jnFunc = require("./jnServerFile.js");
var my_func = jnFunc(function() {
	console.log(this);
	return "test";
});
module.exports = my_func;