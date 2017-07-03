import { IConstructorOf } from "./collections";
import { HttpContext } from "./http";


function _super(o: any) { return o.prototype.__proto__; }
(global as any)._super = _super;

export class WebService {
    public static extend(oPar: {}): IConstructorOf<WebService> {
        const cls = class extends WebService {};
        Object.assign(cls.prototype, oPar);
        return cls;
    }
    public isReady: boolean = true;
    protected ctx: HttpContext;
    protected _method: string;
    get method(): string { return this._method; }

    // Set by the webservice constructor indicating the method can be called by roadie or not

    constructor(ctx: HttpContext, method: string) {
        this.create(ctx, method);
    }

    public async _execute_(method: string) {
        try {
            const d = await this[method]();
            if (d !== undefined) {
                this.ctx.response.data(d);
                this.ctx.response.send();
            }
        } catch (e) {
            this.ctx.error(e);
        }

    }

    // Use the create call for backwards compatibility
    public create(ctx: HttpContext, method: string) {
        this.ctx = ctx;
        this._method = method;
    }

}
