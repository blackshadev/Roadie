module.exports = {
	transfers: {},
	transfer: function(name) {
		this.transfers[name] = eval(name);
	}
};