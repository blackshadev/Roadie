
module.exports = function() {
	var out = "";
	out = objToString(this.client, "<br />", "&emsp;");
	return out;
};

function objToString(obj, newl, tab) {
	newl = newl || "\r\n";
	tab = tab || "\t";
	var out = "{" + newl;
	for(var key in obj) {
		var val = obj[key];
		if(val && val.toString && val.toString() === "[object Object]")
			val = objToString(val, newl, tab + tab);
		out += tab + key + ": " + val + "," + newl;
	}
	return out + "}";
}