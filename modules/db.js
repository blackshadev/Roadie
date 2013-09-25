var browserutils = require('./browserutils');
var data = { greeting: 'Hi!' };

module.exports = {
	set: function(k, v) {
		return data[k] = v;
	},
	get: function(k) {
		return (function() {
			if (typeof(XMLHttpRequest) === 'undefined') {
				return data[k];
			} else {
				var elemId = 'db-retrieve-' + this.key;
				var req = new XMLHttpRequest();
				req.onreadystatechange = function() {
					if (req.readyState === 4) {
						utils.write(JSON.parse(req.responseText));
					}
				};
				req.open('GET', '/cgi-bin/db.js?key=' + this.key);
				req.send();
				return '<script id="' + elemId + '"/>';
			}
		}).bind({ key: k });
	}
};