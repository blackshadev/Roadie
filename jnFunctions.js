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
		setHeader: function(key,val) { return self.setHeader(key, val);},
		setCookie: function(key,val, args, flags) {
			return self.setCookie(key, val, args, flags);
		},
		getClientHeaders: function() { return self.getClientHeaders(); },

		send: function() { return self.send(); },
		wait: function() { self.queue.add(); },
		done: function() { self.queue.sub(); },
		compress: function() { self.compress(); },
		require: require
	};
};