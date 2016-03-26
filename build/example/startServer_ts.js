"use strict";
var j = require("../");
var routes = [
    "routing.json",
    {
        "[GET]/query/": function (ctx) {
            ctx.response.data("static");
            ctx.response.send();
        }
    }
];
var server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
j.setDefaultServer(server);
server.addRoutes(routes[0]);
server.addRoutes(routes[1]);
require('./webservices/ws.js');
console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
console.log = function () { };
server.start();
//# sourceMappingURL=startServer_ts.js.map