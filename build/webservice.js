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
function _super(o) { return o.prototype.__proto__; }
global._super = _super;
class WebService {
    constructor(ctx, method) {
        this.isReady = true;
        this.create(ctx, method);
    }
    static extend(oPar) {
        const cls = class extends WebService {
        };
        Object.assign(cls.prototype, oPar);
        return cls;
    }
    get method() { return this._method; }
    _execute_(method) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const d = yield this[method]();
                if (d !== undefined) {
                    this.ctx.response.data(d);
                    this.ctx.response.send();
                }
            }
            catch (e) {
                this.ctx.error(e);
            }
        });
    }
    create(ctx, method) {
        this.ctx = ctx;
        this._method = method;
    }
}
exports.WebService = WebService;
//# sourceMappingURL=webservice.js.map