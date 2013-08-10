(function() {
	var http = require('http');
	var fs = require("fs");
	require("./core.js");

	var server = new $jn.TServer({
		location: '127.0.0.1',
		port: 80
	});
	server.start();
})();