var resToString = function(arr, inclHeader) {
	var out = "";
	var key;

	if(inclHeader) {
		out += "<tr>";
		for(key in arr[1]) {
			if(!arr[1].hasOwnProperty(key)) continue;
			out += "<th>" + key + "</th>";
		}
		out += "</tr>";
	}
	for(var iX = 1; iX < arr.length; iX++) {
		out += "<tr>";
		for(key in arr[iX]) {
			if(!arr[iX] || !arr[iX].hasOwnProperty(key)) continue;
			out += "<td>" + arr[iX][key] + "</td>";
		}
		out += "</tr>";
	}
	return out;
};

wait();
var mysql = require("mysql");
var conn = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'posbackup'
});
conn.connect();

print("<table>");
var isFirst = true;
conn.query("SELECT * FROM artikellen", function(err, results) {
	if(err) { print("Error had occured: " + err); done(); return; }
	print(resToString(results, isFirst));
	isFirst = false;
	done();
});

print("Dit werkt dus ng niet");