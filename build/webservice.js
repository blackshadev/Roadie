"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function _super(o) { return o.prototype.__proto__; }
;
global._super = _super;
class WebService {
    constructor(ctx, method) {
        this.isReady = true;
        this.create(ctx, method);
    }
    get method() { return this._method; }
    ;
    _execute_(method) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[webservice.ts:21]", method);
            try {
                let d = yield this[method]();
                console.log("[webservice.ts:24]", d);
                if (d !== undefined) {
                    this.ctx.response.data(d);
                    this.ctx.response.send();
                }
            }
            catch (e) {
                console.log("[webservice.ts:30] Err", e);
                this.ctx.error(e);
            }
        });
    }
    create(ctx, method) {
        this.ctx = ctx;
        this._method = method;
    }
    static extend(oPar) {
        let cls = class extends WebService {
        };
        Object.assign(cls.prototype, oPar);
        return cls;
    }
}
exports.WebService = WebService;
//# sourceMappingURL=webservice.js.map