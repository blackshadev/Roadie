import { HttpContext } from "./http";
import { constructorOf } from "./collections";


function _super(o: any) { return o.prototype.__proto__; };
(<any>global)._super = _super;

export class WebService {
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
        let cls = class extends WebService {}
        Object.assign(cls.prototype, oPar);
        return cls;
    }
}