import { HttpContext } from "./http";

export default class WebService {
    protected ctx: HttpContext;
    protected _method: string;
    get method(): string { return this._method; };

    // Set by the webservice constructor indicating the method can be called by roadie or not
    isReady: boolean = true;

    constructor(ctx: HttpContext, method: string) {
        this.ctx = ctx;
        this._method = method;
    }
}