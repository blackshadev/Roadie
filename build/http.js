"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const http_1 = require("http");
const https_1 = require("https");
const BufferReader_1 = require("./BufferReader");
const errno_1 = require("./errno");
const routemap_1 = require("./routemap");
const endpoints_1 = require("./endpoints");
const url_1 = require("url");
var HttpVerb;
(function (HttpVerb) {
    HttpVerb[HttpVerb["GET"] = 0] = "GET";
    HttpVerb[HttpVerb["POST"] = 1] = "POST";
    HttpVerb[HttpVerb["PUT"] = 2] = "PUT";
    HttpVerb[HttpVerb["DELETE"] = 3] = "DELETE";
    HttpVerb[HttpVerb["UPGRADE"] = 4] = "UPGRADE";
    HttpVerb[HttpVerb["TRACE"] = 5] = "TRACE";
    HttpVerb[HttpVerb["HEAD"] = 6] = "HEAD";
    HttpVerb[HttpVerb["OPTIONS"] = 7] = "OPTIONS";
    HttpVerb[HttpVerb["UPDATE"] = 8] = "UPDATE";
})(HttpVerb = exports.HttpVerb || (exports.HttpVerb = {}));
function parseHttpVerb(verb) {
    let v = HttpVerb[verb];
    if (typeof (HttpVerb.GET) !== typeof (v))
        throw new Error("Invalid HttpVerb");
    return v;
}
exports.parseHttpVerb = parseHttpVerb;
class HttpRequest {
    get url() { return this._req.url; }
    ;
    get method() { return this._req.method; }
    get parameters() { return this._parameters; }
    ;
    get ctx() { return this._ctx; }
    get uri() { return this._uri; }
    get queryParams() { return this._queryParameters; }
    ;
    get request() { return this._req; }
    constructor(ctx, route, req) {
        this._ctx = ctx;
        this._req = req;
        this._parameters = route.params;
        this._uri = route.uri;
        this._reader = new BufferReader_1.BufferReader(parseInt(this.header("content-length")), req);
        this.parseUrl();
    }
    parseUrl() {
        const oPar = url_1.parse(this._req.url, true);
        this._queryString = oPar.search;
        this._queryParameters = oPar.query;
    }
    readBody(cb) {
        this._reader.read(cb);
    }
    header(headerName) { return this._req.headers[headerName]; }
    queryParameter(paramName) { return this._queryParameters[paramName]; }
    parameter(paramName) { return this._parameters[paramName]; }
}
exports.HttpRequest = HttpRequest;
class HttpResponse {
    constructor(ctx, resp) {
        this.statusCode = 200;
        this.eos = false;
        this._encoding = "utf8";
        this._ctx = ctx;
        this._resp = resp;
        this.headers = {};
        this._startTime = Date.now();
    }
    get response() { return this._resp; }
    get ctx() { return this._ctx; }
    status(code) {
        this.statusCode = code;
    }
    set contentType(val) { this.headers["Content-Type"] = val; }
    header(headerName, value) {
        this.headers[headerName] = value;
    }
    data(dat) {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
            this.header("Content-Type", "application/json");
        }
        this._data = dat;
    }
    append(dat) {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object")
            dat = JSON.stringify(dat);
        if (bin && this._data instanceof Buffer)
            Buffer.concat([this._data, dat]);
        else
            this._data += dat.toString();
    }
    send() {
        if (this.eos)
            return this._ctx.server.log("server", "Request already send");
        var len = typeof (this._data) === "string" ? Buffer.byteLength(this._data, this._encoding) : this._data.length;
        this.headers["Content-Length"] = len + "";
        this.headers["Date"] = new Date().toUTCString();
        this._resp.writeHead(this.statusCode, this.headers);
        this._resp.end(this._data);
        this.eos = true;
        var t = Date.now() - this._startTime;
        this._ctx.server.log("server", " send: " + typeof (this._data) +
            " of length " + len + " bytes, took " + t + "ms");
    }
}
exports.HttpResponse = HttpResponse;
class HttpError {
    constructor(err, errtxt, extra) {
        this.statuscode = 500;
        if (err.statuscode !== undefined) {
            this.statuscode = err.statuscode;
            this.text = err.text || err.message;
            this.extra = err.extra;
        }
        else if (err instanceof Error) {
            let errDescr = HttpError.translateErrNo(err.errno);
            this.statuscode = errDescr && errDescr.http ? errDescr.http : 500;
            this.text = errDescr ? errDescr.description : err.name;
            this.extra = err.toString();
        }
        else if (typeof (err) === "number") {
            this.statuscode = err;
            this.text = errtxt ? errtxt : HttpError.httpStatusText(this.statuscode);
            if (extra)
                this.extra = extra;
        }
    }
    send(ctx) {
        ctx.response.status(this.statuscode);
        ctx.response.data("<h1>" + this.statuscode + " " + this.text + "</h1>");
        if (this.extra)
            ctx.response.append(this.extra);
        ctx.response.send();
    }
    static translateErrNo(no) { return errno_1.errno[no]; }
    ;
    static httpStatusText(no) {
        return http_1.STATUS_CODES[no];
    }
}
exports.HttpError = HttpError;
class HttpContext {
    get url() { return this.request.url; }
    get method() { return this.request.method; }
    get server() { return this._server; }
    constructor(serv, route, req, resp) {
        this._server = serv;
        this.route = route;
        this.request = new HttpRequest(this, route, req);
        this.response = new HttpResponse(this, resp);
    }
    execute() {
        if (this.route.resource)
            this.route.resource.execute(this);
        else
            this.error(404);
    }
    error(err, errtxt, extra) {
        let error = new HttpError(err, errtxt, extra);
        if (this._server.onError)
            this._server.onError(error, this);
        else
            error.send(this);
    }
    cwd() { return this._server.cwd; }
}
exports.HttpContext = HttpContext;
function WebMethod(route, oPar) {
    oPar = oPar || {};
    oPar.server = oPar.server || RoadieServer.Default;
    return function (target, method, descr) {
        if (typeof (descr.value) !== "function")
            throw new Error(`Given WebMethod ${method} is not a function`);
        const endpoint = new endpoints_1.WebMethodEndpoint(target.constructor, method, oPar.data);
        oPar.server.addRoute(route, endpoint);
    };
}
exports.WebMethod = WebMethod;
class RoadieServer {
    constructor(oPar) {
        this._port = 80;
        this._rootDir = process.cwd();
        this._webserviceDir = "webservices";
        this._connections = {};
        this._port = oPar.port !== undefined ? oPar.port : oPar.tlsOptions !== undefined ? 443 : 80;
        this._host = oPar.host || this._host;
        this._webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this._rootDir = oPar.root || this._rootDir;
        this._verbose = !!oPar.verbose;
        this._routemap = new routemap_1.RouteMap();
        if (!this._verbose)
            this.log = function () { };
        this._tlsOptions = oPar.tlsOptions;
        this._server = this.createServer();
    }
    get port() { return this._port; }
    ;
    get host() { return this._host; }
    ;
    get cwd() { return this._rootDir; }
    get webserviceDir() { return this._rootDir + "/" + this._webserviceDir; }
    get useHttps() { return !!this._tlsOptions; }
    addConnection(sock) {
        let key = sock.remoteAddress + ":" + sock.remotePort;
        this._connections[key] = sock;
        sock.on("close", () => delete this._connections[key]);
    }
    createServer() {
        const _h = (req, resp) => {
            let verb = parseHttpVerb(req.method);
            let route = this.getRoute(req.url, verb);
            let ctx = new HttpContext(this, route, req, resp);
            ctx.execute();
        };
        let serv;
        if (this.useHttps)
            serv = https_1.createServer(this._tlsOptions, _h);
        else
            serv = http_1.createServer(_h);
        serv.on("connection", (s) => this.addConnection(s));
        return serv;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._server.listen(this._port, this._host, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._server.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
                for (let key in this._connections) {
                    this._connections[key].destroy();
                }
            });
        });
    }
    getRoute(url, verb) {
        url = url_1.parse(url).pathname;
        return this._routemap.getRoute(url, verb);
    }
    include(svcFile, isAbsolute) {
        require(!isAbsolute ? (this.webserviceDir + "/" + svcFile + ".js") : svcFile);
    }
    addRoute(route, endpoint, data) {
        const endp = endpoint instanceof endpoints_1.Endpoint ?
            endpoint :
            endpoints_1.Endpoint.Create(endpoint, data);
        this._routemap.addRoute(route, endp);
    }
    log(...args) {
        console.log.apply(console, args);
    }
    addRoutes(routes) {
        if (routes instanceof Array) {
            for (var i = 0; i < routes.length; i++)
                this.addRoutes(routes[i]);
            return;
        }
        if (typeof (routes) === "string")
            routes = require(`${this._rootDir}/${routes}`);
        if (typeof (routes) !== "object")
            throw new Error("Invalid route argument given");
        for (var k in routes)
            this.addRoute(k, routes[k]);
    }
}
exports.RoadieServer = RoadieServer;
//# sourceMappingURL=http.js.map