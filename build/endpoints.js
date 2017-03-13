"use strict";
const collections_1 = require("./collections");
class Endpoints extends collections_1.Map {
}
exports.Endpoints = Endpoints;
class Endpoint {
    constructor(script, data) {
        this.script = script;
        this.data = data;
    }
    static Create(script, data) {
        switch (typeof (script)) {
            case "function": return new FunctionEndpoint(script, data);
            case "string": return new ScriptEndpoint(script, data);
        }
        throw new Error("Unknown endpoint type");
    }
}
exports.Endpoint = Endpoint;
class WebMethodEndpoint extends Endpoint {
    constructor(cls, method, data) {
        super(cls, data);
        this.method = method;
    }
    execute(ctx) {
        let svc = new this.script(ctx, this.method);
        if (svc.isReady)
            svc._execute_(this.method);
    }
}
exports.WebMethodEndpoint = WebMethodEndpoint;
class ScriptEndpoint extends Endpoint {
    constructor(script, data) {
        let parts = script.split(":");
        super(script, data);
        this.fileName = parts[0];
        this.method = parts[1];
    }
    execute(ctx) {
        if (!this._class)
            this._class = require(ctx.server.webserviceDir + "/" + this.fileName);
        let svc = new this._class(ctx, this.method);
        if (svc.isReady)
            svc._execute_(this.method);
    }
}
exports.ScriptEndpoint = ScriptEndpoint;
class FunctionEndpoint extends Endpoint {
    execute(ctx) { this.script(ctx); }
}
exports.FunctionEndpoint = FunctionEndpoint;
//# sourceMappingURL=endpoints.js.map