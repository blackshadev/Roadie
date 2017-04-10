import j = require("../");
import fs = require("fs");
// tslint:disable:no-console

// Accepts file names  with routes and json object with routes.
// All routes are prefixed the HTTP verb (defaults to all).
// The route itsef can contain a wildcard (*) and parameters ({paramName})
// The route must map to a js file containing the webservice or a function which to execute
let routes = [
    "routing.json",
    {
        "[GET]/query/": (ctx) => {
            // echo the parameters in the search query of the URL
            ctx.response.data("static");
            ctx.response.send();
        },
    },
];
let server: j.Server;

async function all() {
    // HTTP server
    server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
    // HTTPS server
    // var server = new j.Server({
    //         port: 8080, root: "./webservices/",
    //         useHttps: true,
    //         tlsOptions: {
    //             // For all options see
    //             // http://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
    //             key : fs.readFileSync("./ssl/server.key"),
    //             cert: fs.readFileSync("./ssl/server.crt")
    //         }
    //     });
    // var config = new j.ConfigServer(server, { port: 4242 });

    j.setDefaultServer(server);
    server.addRoutes(routes[0]);
    server.addRoutes(routes[1]);
    require("./webservices/ws.js");

    await server.start();
    console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
}

let first = true;
process.on("SIGINT", async () => {
    if (first) {
        first = false;
        console.log("Gracefully stopping, pres ctrl+c again to force stop");
        await server.stop();
    } else {
        process.exit();
    }
});

all();
