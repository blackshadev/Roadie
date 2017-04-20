"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpMocks = require("node-mocks-http");
const http_1 = require("../http");
function createMockContext(oPar) {
    const request = httpMocks.createRequest({
        method: oPar.method || "GET",
        url: oPar.url,
        headers: oPar.headers,
    });
    const resp = httpMocks.createResponse();
    const serv = oPar.server || { cwd: "/" };
    if (serv.cwd === undefined) {
        serv.cwd = serv.cwd || "/";
    }
    const route = oPar.route || {
        params: {},
        path: {},
        resource: null,
        uri: "",
    };
    let body = Buffer.alloc(0);
    switch (typeof (oPar.body)) {
        case "string":
            body = Buffer.from(oPar.body);
            break;
        case "object":
            if (oPar.body instanceof Buffer) {
                body = oPar.body;
            }
            else {
                body = Buffer.from(JSON.stringify(oPar.body));
                break;
            }
        default:
            body = Buffer.alloc(0);
            break;
    }
    let ctx = new http_1.HttpContext(serv, route, request, resp);
    ctx.request.readBody = (cb) => cb(body);
    return ctx;
}
exports.createMockContext = createMockContext;
//# sourceMappingURL=http.js.map