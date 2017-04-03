"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./http");
let s = new http_1.RoadieServer({});
s.addRoute("[GET]/", function (ctx) {
    ctx.response.contentType = "text/html";
    ctx.response.data("<h1>Hallo!</h1>");
    ctx.response.send();
});
s.addRoute("[GET]/{a}/{b}", function (ctx) {
    ctx.response.header("Content-Type", "text/html");
    ctx.response.data("<h1>Params:</h1>");
    ctx.response.append("a: " + ctx.request.parameters["a"] + "<br />");
    ctx.response.append("b: " + ctx.request.parameters["b"] + "<br />");
    ctx.response.send();
});
s.start();
//# sourceMappingURL=start.js.map