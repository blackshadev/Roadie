var j = require("../roadie.js");

// Accepts file names with routes and json object with routes.
// All routes are prefixed the HTTP verb (defaults to all).
// The route itsef can contain a wildcard (*) and parameters ({paramName})
var routes = ["routing.json", { "[GET,POST]/statics/*" : "static.js" }]

var server = new j.Server({port: 8080, configPort: 4242, root: "./webservices/" });
var config = new j.ConfigServer(server, { port: 4242 });
    
server.addRoutes(routes);

console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html")
server.start();
config.start();