"use strict";
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