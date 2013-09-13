(function() {
	var http = require('http');
	var fs = require("fs");
	require("./junction.js");

	var config = {};
	if(fs.existsSync("config.json")) {
		config = require("./config.json");
	}
	
	var server = new $jn.TServer(config);
	server.start();
})();