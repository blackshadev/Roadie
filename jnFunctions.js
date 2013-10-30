/* The dynamic functions.
 * The given dynamic object (self) must implement everything from jnAbstract
 */

module.exports = function(self) {
	return {
		/* Globally scoped variables */
		print: function(data) {
			self.content += (typeof(data) === "object") ?
				data.toSource() : data;
		},
		setCookie: function(key,val, args, flags) {
			return self.setCookie(key, val, args, flags);
		},
		getClientHeaders: function() { return self.getClientHeaders(); },
		response: {
			setHeader: function(key,val) { return self.setHeader(key, val);},
			send: function(force) { return self.send(force); },
			wait: function() { self.queue.add(); },
			done: function() { self.queue.sub(); },
			compressResponse: function(flag) { self.setCompression(flag); },
		},
		client: {
			headers: function() { return self.getClientHeader(1); },
			data: function() { return self.getClientHeader(2); },
			method: function() { return self.getClientHeader(4); },
			query: function() { return self.getClientHeader(8); },
			cookies: function() { return self.getClientHeader(16); },
			all: function() { return self.getClientHeader(31); }
		},
		require: require
	};
};