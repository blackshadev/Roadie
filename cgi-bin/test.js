require("./jcCookies.js");
module.exports = function(inp) {
	var out = "";
	out = objToString(inp, "<br />", "&emsp;");
	return { headers: { 'Content-Type': "text/html" } , data: out };
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