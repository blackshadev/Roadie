var jnFunc = require("./jServerFile.js");
var my_func = jnFunc(function() {
	console.log(this);
});
module.exports = my_func(args);