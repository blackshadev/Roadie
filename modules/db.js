var browserutils = require('./browserutils');
var data = { greeting: 'Hi!' };

module.exports = {
	set: function(k, v) {
		return data[k] = v;
	},
	get: function(k) {
		browserutils.transfers['key'] = k;
		return function() {
			if (typeof(XMLHttpRequest) === 'undefined') {
				return data[k];
			} else {
				var elemId = 'db-retrieve-' + key;
				var req = new XMLHttpRequest();
				req.onreadystatechange = function() {
					if (req.readyState === 4) {
						var res = document.createTextNode(JSON.parse(req.responseText));
						var dest = document.getElementById(elemId);
						dest.parentNode.insertBefore(res, dest);
					}
				};
				req.open('GET', 'http://127.0.0.1:1337/cgi-bin/db.js?key=' + key);
				req.send();
				return '<script id="' + elemId + '"/>';
			}
		};
	}
};