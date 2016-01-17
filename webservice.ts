import { HttpContext } from "./http";
import { constructorOf } from "./collections";


function _super(o: Object) { return Object.getPrototypeOf(o).prototype; };
(<any>global)._super = _super;

export default class WebService {
    protected ctx: HttpContext;
    protected _method: string;
    get method(): string { return this._method; };

    // Set by the webservice constructor indicating the method can be called by roadie or not
    isReady: boolean = true;

    constructor(ctx: HttpContext, method: string) {
        this.create(ctx, method);
    }
    
    // Use the create call for backwards compatibility
    create(ctx: HttpContext, method: string) {
        this.ctx = ctx;
        this._method = method;
    }

    static extend(oPar: {}): constructorOf<WebService> {
        let fn = function (ctx: HttpContext, method: string) {
            WebService.prototype.constructor.call(this, ctx, method);
        };
        fn.prototype = Object.create(this);
        for (let k in oPar)
            fn.prototype[k] = oPar[k];

        return <any>fn;
    }
}