import { RoadieServer, HttpContext } from "./http"


let s = new RoadieServer({});

s.addRoute("[GET]/", function (ctx: HttpContext) {
    ctx.response.contentType = "text/html";
    ctx.response.data("<h1>Hallo!</h1>");
    ctx.response.send();
});

s.addRoute("[GET]/{a}/{b}", function (ctx: HttpContext) {
    ctx.response.header("Content-Type", "text/html");
    ctx.response.data("<h1>Params:</h1>");
    ctx.response.append("a: " + ctx.request.parameters["a"] + "<br />");
    ctx.response.append("b: " + ctx.request.parameters["b"] + "<br />");
    
    ctx.response.send();
});

s.start();
