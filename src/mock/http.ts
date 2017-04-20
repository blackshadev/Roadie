import * as httpMocks from "node-mocks-http";
import { HttpContext } from "../http";
import { IRoutingResult } from "../routing/router";

export interface IMockContextParams {
    url: string;
    method?: string;
    headers?: { [headername: string]: string };
    body?: string|Buffer;
    server?: {
        cwd?: string;
        onError: Function;
    };
    route?: Partial<IRoutingResult>;
}

export function createMockContext(oPar: IMockContextParams) {
    const request  = httpMocks.createRequest({
        method: oPar.method || "GET",
        url: oPar.url,
        headers: oPar.headers,
    });
    const resp  = httpMocks.createResponse();
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
    switch (typeof(oPar.body)) {
        case "string": body = Buffer.from(oPar.body as string);  break;
        case "object":
            if (oPar.body instanceof Buffer) {
                body = oPar.body;
            } else {
                body = Buffer.from(JSON.stringify(oPar.body));  break;
            }
        default: body = Buffer.alloc(0); break;
    }
    let ctx = new HttpContext(serv as any, route as any, request, resp);
    ctx.request.readBody = (cb) => cb(body);

    return  ctx;
}
