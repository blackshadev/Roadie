"use strict";
function _super(o) { return o.prototype.__proto__; }
;
global._super = _super;
var WebService = (function () {
    function WebService(ctx, method) {
        this.isReady = true;
        this.create(ctx, method);
    }
    Object.defineProperty(WebService.prototype, "method", {
        get: function () { return this._method; },
        enumerable: true,
        configurable: true
    });
    ;
    WebService.prototype.create = function (ctx, method) {
        this.ctx = ctx;
        this._method = method;
    };
    WebService.extend = function (oPar) {
        var fn = function (ctx, method) {
            WebService.prototype.constructor.call(this, ctx, method);
        };
        fn.prototype = Object.create(this.prototype);
        for (var k in oPar)
            fn.prototype[k] = oPar[k];
        return fn;
    };
    return WebService;
}());
exports.WebService = WebService;
//# sourceMappingURL=webservice.js.map