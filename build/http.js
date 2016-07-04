"use strict";
var http_1 = require("http");
var https_1 = require("https");
var BufferReader_1 = require("./BufferReader");
var errno_1 = require("./errno");
var routemap_1 = require("./routemap");
var endpoints_1 = require("./endpoints");
var url_1 = require("url");
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
})(exports.HttpVerb || (exports.HttpVerb = {}));
var HttpVerb = exports.HttpVerb;
function parseHttpVerb(verb) {
    var v = HttpVerb[verb];
    if (typeof (HttpVerb.GET) !== typeof (v))
        throw new Error("Invalid HttpVerb");
    return v;
}
exports.parseHttpVerb = parseHttpVerb;
var HttpRequest = (function () {
    function HttpRequest(ctx, route, req) {
        this._ctx = ctx;
        this._req = req;
        this._parameters = route.params;
        this._uri = route.uri;
        this._reader = new BufferReader_1.BufferReader(parseInt(this.header("content-length")), req);
        this.parseUrl();
    }
    Object.defineProperty(HttpRequest.prototype, "url", {
        get: function () { return this._req.url; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(HttpRequest.prototype, "method", {
        get: function () { return this._req.method; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpRequest.prototype, "parameters", {
        get: function () { return this._parameters; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(HttpRequest.prototype, "ctx", {
        get: function () { return this._ctx; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpRequest.prototype, "uri", {
        get: function () { return this._uri; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpRequest.prototype, "queryParams", {
        get: function () { return this._queryParameters; },
        enumerable: true,
        configurable: true
    });
    ;
    HttpRequest.prototype.parseUrl = function () {
        var oPar = url_1.parse(this._req.url, true);
        this._queryString = oPar.search;
        this._queryParameters = oPar.query;
    };
    HttpRequest.prototype.readBody = function (cb) {
        this._reader.read(cb);
    };
    HttpRequest.prototype.header = function (headerName) { return this._req.headers[headerName]; };
    HttpRequest.prototype.queryParameter = function (paramName) { return this._queryParameters[paramName]; };
    HttpRequest.prototype.parameter = function (paramName) { return this._parameters[paramName]; };
    return HttpRequest;
}());
exports.HttpRequest = HttpRequest;
var HttpResponse = (function () {
    function HttpResponse(ctx, resp) {
        this.statusCode = 200;
        this.eos = false;
        this._encoding = "utf8";
        this._ctx = ctx;
        this.resp = resp;
        this.headers = {};
        this._startTime = Date.now();
    }
    Object.defineProperty(HttpResponse.prototype, "ctx", {
        get: function () { return this._ctx; },
        enumerable: true,
        configurable: true
    });
    HttpResponse.prototype.status = function (code) {
        this.statusCode = code;
    };
    Object.defineProperty(HttpResponse.prototype, "contentType", {
        set: function (val) { this.headers["Content-Type"] = val; },
        enumerable: true,
        configurable: true
    });
    HttpResponse.prototype.header = function (headerName, value) {
        this.headers[headerName] = value;
    };
    HttpResponse.prototype.data = function (dat) {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
            this.header("Content-Type", "application/json");
        }
        this._data = dat;
    };
    HttpResponse.prototype.append = function (dat) {
        var bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object")
            dat = JSON.stringify(dat);
        if (bin && this._data instanceof Buffer)
            Buffer.concat([this._data, dat]);
        else
            this._data += dat.toString();
    };
    HttpResponse.prototype.send = function () {
        if (this.eos)
            return console.log("server", "Request already send");
        var len = typeof (this._data) === "string" ? Buffer.byteLength(this._data, this._encoding) : this._data.length;
        this.headers["Content-Length"] = len + "";
        this.headers["Date"] = new Date().toUTCString();
        this.resp.writeHead(this.statusCode, this.headers);
        this.resp.end(this._data);
        this.eos = true;
        var t = Date.now() - this._startTime;
        console.log("server", " send: " + typeof (this._data) +
            " of length " + len + " bytes, took " + t + "ms");
    };
    return HttpResponse;
}());
exports.HttpResponse = HttpResponse;
var HttpError = (function () {
    function HttpError(err, errtxt, extra) {
        this.code = 500;
        if (err instanceof HttpError) {
            this.code = err.code;
            this.text = err.text;
            this.extra = err.extra;
        }
        else if (err instanceof Error) {
            var errDescr = HttpError.translateErrNo(err.errno);
            this.code = errDescr && errDescr.http ? errDescr.http : 500;
            this.text = errDescr ? errDescr.description : err.name;
            this.extra = err.toString();
        }
        else if (typeof (err) === "number") {
            this.code = err;
            this.text = errtxt ? errtxt : HttpError.httpStatusText(this.code);
            if (extra)
                this.extra = extra;
        }
    }
    HttpError.prototype.send = function (ctx) {
        ctx.response.status(this.code);
        ctx.response.data("<h1>" + this.code + " " + this.text + "</h1>");
        if (this.extra)
            ctx.response.append(this.extra);
        ctx.response.send();
    };
    HttpError.translateErrNo = function (no) { return errno_1.errno[no]; };
    ;
    HttpError.httpStatusText = function (no) {
        return http_1.STATUS_CODES[no];
    };
    return HttpError;
}());
exports.HttpError = HttpError;
var HttpContext = (function () {
    function HttpContext(serv, route, req, resp) {
        this._server = serv;
        this.route = route;
        this.request = new HttpRequest(this, route, req);
        this.response = new HttpResponse(this, resp);
    }
    Object.defineProperty(HttpContext.prototype, "url", {
        get: function () { return this.request.url; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpContext.prototype, "method", {
        get: function () { return this.request.method; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpContext.prototype, "server", {
        get: function () { return this._server; },
        enumerable: true,
        configurable: true
    });
    HttpContext.prototype.execute = function () {
        if (this.route.resource)
            this.route.resource.execute(this);
        else
            this.error(404);
    };
    HttpContext.prototype.error = function (err, errtxt, extra) {
        var error = new HttpError(err, errtxt, extra);
        if (this._server.onError)
            this._server.onError(error, this);
        else
            error.send(this);
    };
    HttpContext.prototype.cwd = function () { return this._server.cwd; };
    return HttpContext;
}());
exports.HttpContext = HttpContext;
function WebMethod(route, oPar) {
    oPar = oPar || {};
    oPar.server = oPar.server || RoadieServer.Default;
    return function (target, method, descr) {
        if (typeof (descr.value) !== "function")
            throw new Error("Given WebMethod " + method + " is not a function");
        var endpoint = new endpoints_1.WebMethodEndpoint(target.constructor, method, oPar.data);
        oPar.server.addRoute(route, endpoint);
    };
}
exports.WebMethod = WebMethod;
var RoadieServer = (function () {
    function RoadieServer(oPar) {
        this._port = 80;
        this._rootDir = process.cwd();
        this._webserviceDir = "webservices";
        this._port = oPar.port || this._port;
        this._host = oPar.host || this._host;
        this._webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this._rootDir = oPar.root || this._rootDir;
        this._routemap = new routemap_1.RouteMap();
        this._tlsOptions = oPar.tlsOptions;
        this._server = this.createServer();
    }
    Object.defineProperty(RoadieServer.prototype, "port", {
        get: function () { return this._port; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RoadieServer.prototype, "host", {
        get: function () { return this._host; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RoadieServer.prototype, "cwd", {
        get: function () { return this._rootDir; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoadieServer.prototype, "webserviceDir", {
        get: function () { return this._rootDir + "/" + this._webserviceDir; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoadieServer.prototype, "useHttps", {
        get: function () { return !!this._tlsOptions; },
        enumerable: true,
        configurable: true
    });
    RoadieServer.prototype.createServer = function () {
        var _this = this;
        var _h = function (req, resp) {
            var verb = parseHttpVerb(req.method);
            var route = _this.getRoute(req.url, verb);
            var ctx = new HttpContext(_this, route, req, resp);
            ctx.execute();
        };
        if (this.useHttps)
            return https_1.createServer(this._tlsOptions, _h);
        else
            return http_1.createServer(_h);
    };
    RoadieServer.prototype.start = function () {
        this._server.listen(this._port, this._host);
        console.log("listening on port " + this._host + ":" + this._port);
    };
    RoadieServer.prototype.getRoute = function (url, verb) {
        url = url_1.parse(url).pathname;
        return this._routemap.getRoute(url, verb);
    };
    RoadieServer.prototype.include = function (svcFile, isAbsolute) {
        require(!isAbsolute ? (this.webserviceDir + "/" + svcFile + ".js") : svcFile);
    };
    RoadieServer.prototype.addRoute = function (route, endpoint, data) {
        var endp = endpoint instanceof endpoints_1.Endpoint ?
            endpoint :
            endpoints_1.Endpoint.Create(endpoint, data);
        this._routemap.addRoute(route, endp);
    };
    RoadieServer.prototype.addRoutes = function (routes) {
        if (routes instanceof Array) {
            for (var i = 0; i < routes.length; i++)
                this.addRoutes(routes[i]);
            return;
        }
        if (typeof (routes) === "string")
            routes = require(this._rootDir + "/" + routes);
        if (typeof (routes) !== "object")
            throw new Error("Invalid route argument given");
        for (var k in routes)
            this.addRoute(k, routes[k]);
    };
    return RoadieServer;
}());
exports.RoadieServer = RoadieServer;
//# sourceMappingURL=http.js.map