"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const j = require("../");
var routes = [
    "routing.json",
    {
        "[GET]/query/": function (ctx) {
            ctx.response.data("static");
            ctx.response.send();
        }
    }
];
function all() {
    return __awaiter(this, void 0, void 0, function* () {
        var server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
        j.setDefaultServer(server);
        server.addRoutes(routes[0]);
        server.addRoutes(routes[1]);
        require('./webservices/ws.js');
        yield server.start();
        console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
    });
}
all();
//# sourceMappingURL=startServer_ts.js.map