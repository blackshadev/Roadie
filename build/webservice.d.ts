import { HttpContext } from "./http";
import { constructorOf } from "./collections";
export declare class WebService {
    protected ctx: HttpContext;
    protected _method: string;
    method: string;
    isReady: boolean;
    constructor(ctx: HttpContext, method: string);
    create(ctx: HttpContext, method: string): void;
    static extend(oPar: {}): constructorOf<WebService>;
}
