(function() {
	var Configer = require("../junction.js").ConfigClient;

	var c = new Configer({ host: '127.0.0.1', port: 4242 });
    console.log("When the config shell is connected press ?{enter} for help");
	c.start();

})();