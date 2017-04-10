"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("../");
let routes = {
    0: { path: "/", nodes: [1, 2, 11], endpoints: {} },
    1: {
        path: "query",
        nodes: [],
        endpoints: {
            GET: (ctx) => {
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
let server;
let router;
function waitRnd() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), Math.floor(Math.random() * 55));
        });
    });
}
function getRouteNode(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const node = routes[id];
        let type;
        let nodeName = node.path;
        if (nodeName[0] === "{") {
            nodeName = nodeName.substr(1, nodeName.length - 2);
            type = j.RouteType.parameter;
        }
        else if (nodeName.indexOf("*") > -1) {
            type = j.RouteType.wildcard;
        }
        else {
            type = j.RouteType.static;
        }
        let leafs = Object.keys(node.endpoints).reduce((prev, cur) => {
            return prev | (j.HttpVerb[cur] || 0);
        }, 0);
        return j.AsyncRouteNode.Create(type, {
            name: nodeName,
            data: { id, endpoints: node.endpoints },
            leafs,
        });
    });
}
function all() {
    return __awaiter(this, void 0, void 0, function* () {
        router = new j.AsyncRouter();
        router.getRoot = () => getRouteNode(0);
        router.getRouteChildren = (n) => __awaiter(this, void 0, void 0, function* () {
            let arr = [];
            for (let nodeId of routes[n.data.id].nodes) {
                arr.push(yield getRouteNode(nodeId));
            }
            return arr;
        });
        router.getResource = (n, v) => __awaiter(this, void 0, void 0, function* () {
            let d = n.endpoints[j.HttpVerb[v]];
            return j.Endpoint.Create(d);
        });
        server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
        server.router = router;
        j.setDefaultServer(server);
        yield server.start();
        console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
    });
}
let first = true;
process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
    if (first) {
        first = false;
        console.log("Gracefully stopping, pres ctrl+c again to force stop");
        yield server.stop();
    }
    else {
        process.exit();
    }
}));
all();
//# sourceMappingURL=startServer_async.js.map