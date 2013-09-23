var resToString = function(arr) {
	var out = "<tr>";
	var key;
	if(arr[0])
		for(key in arr[0])
			out += "<th>" + arr[0][key] + "</th>";
	for(var iX = 0; iX < arr.length; iX++)
		for(key in arr[iX])
			out += "<td>" + arr[iX][key] + "</td>";
	return out + "</tr>";
};

module.export = function() {
	var mysql = require("mysql");
	var conn = mysql.createConnection({
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'posbackup'
	});
	conn.connect();
	var out = "";

	out += "<table>";
	conn.query("SELECT * FROM artikellen", function(err, results) {
		if(err) { console.log(err); out += "Error had occured: " + err; return; }
		console.log(results);
		out += resToString(results);
	});

	return "Dit werkt dus ng niet";
};