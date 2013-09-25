module.exports = function() {
	this.setCookie("test", "testVal");
	console.log(this.client);

	this.print("testjeh");
	
	this.send();
};