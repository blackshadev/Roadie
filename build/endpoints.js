"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections_1 = require("./collections");
var Endpoints = (function (_super) {
    __extends(Endpoints, _super);
    function Endpoints() {
        _super.apply(this, arguments);
    }
    return Endpoints;
}(collections_1.Map));
exports.Endpoints = Endpoints;
var Endpoint = (function () {
    function Endpoint(script, data) {
        this.script = script;
        this.data = data;
    }
    Endpoint.Create = function (script, data) {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint(script, data);
            case "string": return new ScriptEndpoint(script, data);
        }
        throw new Error("Unknown endpoint type");
    };
    return Endpoint;
}());
exports.Endpoint = Endpoint;
var WebMethodEndpoint = (function (_super) {
    __extends(WebMethodEndpoint, _super);
    function WebMethodEndpoint(cls, method, data) {
        _super.call(this, cls, data);
        this.method = method;
    }
    WebMethodEndpoint.prototype.execute = function (ctx) {
        var svc = new this.script(ctx, this.method);
        if (svc.isReady)
            svc[this.method]();
    };
    return WebMethodEndpoint;
}(Endpoint));
exports.WebMethodEndpoint = WebMethodEndpoint;
var ScriptEndpoint = (function (_super) {
    __extends(ScriptEndpoint, _super);
    function ScriptEndpoint(script, data) {
        var parts = script.split(":");
        _super.call(this, script, data);
        this.fileName = parts[0];
        this.method = parts[1];
    }
    ScriptEndpoint.prototype.execute = function (ctx) {
        if (!this._class)
            this._class = require(ctx.server.webserviceDir + "/" + this.fileName);
        var svc = new this._class(ctx, this.method);
        if (svc.isReady)
            svc[this.method]();
    };
    return ScriptEndpoint;
}(Endpoint));
exports.ScriptEndpoint = ScriptEndpoint;
var FunctionEndpoint = (function (_super) {
    __extends(FunctionEndpoint, _super);
    function FunctionEndpoint() {
        _super.apply(this, arguments);
    }
    FunctionEndpoint.prototype.execute = function (ctx) { this.script(ctx); };
    return FunctionEndpoint;
}(Endpoint));
exports.FunctionEndpoint = FunctionEndpoint;
//# sourceMappingURL=endpoints.js.map