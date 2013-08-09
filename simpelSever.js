(function() {
	var http = require('http');
	var fs = require("fs");
	require("./core.js");


	http.createServer(function (req, res) {
		var out = "";

		var Request = new $obj.TServerRequest(req, res);
		Request.start();
	
	}).listen(80, '127.0.0.1');
	console.log('Server running at http://127.0.0.1:80/');
})();