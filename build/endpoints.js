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
        return __awaiter(this, void 0, void 0, function* () {
            const svc = new this.script(ctx, this.method);
            if (svc.isReady) {
                return svc._execute_(this.method);
            }
        });
    }
}
exports.WebMethodEndpoint = WebMethodEndpoint;
class ScriptEndpoint extends Endpoint {
    constructor(script, data) {
        const parts = script.split(":");
        super(script, data);
        this.fileName = parts[0];
        this.method = parts[1];
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._class) {
                this._class = require(ctx.server.webserviceDir + "/" + this.fileName);
            }
            const svc = new this._class(ctx, this.method);
            if (svc.isReady) {
                return svc._execute_(this.method);
            }
        });
    }
}
exports.ScriptEndpoint = ScriptEndpoint;
class FunctionEndpoint extends Endpoint {
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.script(ctx, this.data);
        });
    }
}
exports.FunctionEndpoint = FunctionEndpoint;
//# sourceMappingURL=endpoints.js.map