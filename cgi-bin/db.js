var DB = require("../modules/db.js");

module.exports = function(req) {
	if (req.query.key && req.query.value)
		DB.set(req.query.key, JSON.parse(req.query.value));
	return {
		headers: { 'Content-Type': 'text/plain' },
		data: JSON.stringify(DB.get(req.query.key)() || '')
	};
};