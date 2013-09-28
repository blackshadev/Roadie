var DB = require("../modules/db.js");

module.exports = function() {
	var query = this.client.query;
	if (query.key && query.value)
		DB.set(query.key, JSON.parse(query.value));
	this.response.headerObj['Content-Type'] = 'text/plain';
	this.print(JSON.stringify(DB.get(query.key)() || ''));
	this.send();
};