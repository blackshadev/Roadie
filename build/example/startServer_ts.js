"use strict";
var j = require("../");

var routes = [
    "routing.json",
    {
        "[GET,POST]/statics/*": "static.js",
        "[GET]/query/": function (ctx) {
            ctx.response.data(ctx.request.queryParams);
            ctx.response.send();
        }
    }
];
var server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
j.setDefaultServer(server);
server.addRoutes(routes[0]);
require('./webservices/ws.js');
console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
console.log = function(){}; // mute output for benchmarking
server.start();
//# sourceMappingURL=startServer_ts.js.map