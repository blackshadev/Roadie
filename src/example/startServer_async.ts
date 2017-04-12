import j = require("../");
import fs = require("fs");
import { HttpContext } from "../http";
// tslint:disable:no-console
type TRoutes = {
    [id: number]: {
        path: string,
        nodes: number[],
        endpoints: {
            [verb: string]: string|((ctx: HttpContext) => void),
        },
    },
};
// Structure for looking up nodes
let routes: TRoutes = {
    0: { path: "/", nodes: [1, 2, 11], endpoints: {} },
    1: {
        path: "query",
        nodes: [],
        endpoints: {
            GET: (ctx: HttpContext) => {
                ctx.response.data("Tester");
                ctx.response.send();
            },
        },
    },
    2: {
        path: "test",
        nodes: [3, 4, 6, 7, 8, 10],
        endpoints: {
            POST: "test.js:post",
        },
    },
    3: {
        path: "{id}",
        nodes: [],
        endpoints: {
            GET: "test.js:paramExample",
        },
    },
    4: {
        path: "{1}",
        nodes: [5],
        endpoints: {},
    },
    5: {
        path: "{2}",
        nodes: [],
        endpoints: {
            GET: "test.js:paramExample",
        },
    },
    6: {
        path: "error",
        nodes: [],
        endpoints: {
            GET: "test.js:error",
        },
    },
    7: {
        path: "fatal",
        nodes: [],
        endpoints: {
            GET: "test.js:fatal",
        },
    },
    8: {
        path: "hallo",
        nodes: [9],
        endpoints: {
            GET: "test.js:error",
        },
    },
    9: {
        path: "world",
        nodes: [],
        endpoints: {
            GET: "test.js:error",
        },
    },
    10: {
        path: "json",
        nodes: [],
        endpoints: {
            GET: "test.js:getJson",
        },
    },
    11: {
        path: "statics",
        nodes: [12],
        endpoints: {},
    },
    12: {
        path: "*.html",
        nodes: [],
        endpoints: {
            GET: "static.js:html",
        },
    },
};
let server: j.Server;

type RouteNodeData = {
    id: number,
    endpoints: {
        [verb: string]: string|((ctx: j.HttpContext) => void|Promise<any>),
    },
};
let router: j.AsyncRouter<RouteNodeData>;

async function waitRnd() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), Math.floor(Math.random() * 55));
    });
}

/**
 * Function to create a routeNode based on the given ID
 * @param id ID of the node to get
 */
async function getRouteNode(id: number) {
    // // Optional random waits to simulate a datafetch
    // await waitRnd();
    const node = routes[id];
    let type: j.RouteType;
    let nodeName = node.path;
    if (nodeName[0] === "{") {
        nodeName = nodeName.substr(1, nodeName.length - 2);
        type = j.RouteType.parameter;
    } else if (nodeName.indexOf("*") > -1) {
        type = j.RouteType.wildcard;
    } else {
        type = j.RouteType.static;
    }
    // Create the available leafs
    let leafs = Object.keys(node.endpoints).reduce<number>(
        (prev: number, cur: string) => {
            return prev | (j.HttpVerb[cur] || 0);
        },
        0,
    );

    return j.AsyncRouteNode.Create<RouteNodeData>(type, {
        name: nodeName,
        data: { id, endpoints: node.endpoints },
        leafs,
    });
}

async function all() {
    // Create async router
    router = new j.AsyncRouter<RouteNodeData>();

    // Retrieve the root
    router.getRoot = async () => [await getRouteNode(0)];

    // Retrieve children of given node
    router.getRouteChildren = async (n: j.AsyncRouteNode<RouteNodeData>) => {
        let arr: j.AsyncRouteNode<RouteNodeData>[] = [];
        for (let nodeId of routes[n.data.id].nodes) {
            arr.push(await getRouteNode(nodeId));
        }
        return arr;
    };

    // Retrieve resource bound to a given node
    router.getResource = async (n: j.AsyncRouteNode<RouteNodeData>, v: j.HttpVerb) => {
        let d = n.data.endpoints[j.HttpVerb[v]];
        return j.Endpoint.Create(d);
    };

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

    // HTTP server
    server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
    server.router = router;
    j.setDefaultServer(server);
    // server.include("ws");

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
