(function() {
	var http = require('http');
	var fs = require("fs");
	require("./core.js");

	var server = new $jn.TServer({
		location: 'govin.nl',
		port: 1337
	});
	server.start();
})();