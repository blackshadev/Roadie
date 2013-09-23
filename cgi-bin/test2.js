module.export = function() {
	this.setCookie("test", "testVal");
	console.log(this.client);
	return "test";
};