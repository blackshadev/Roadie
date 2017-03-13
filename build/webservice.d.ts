import { HttpContext } from "./http";
import { constructorOf } from "./collections";
export declare class WebService {
    protected ctx: HttpContext;
    protected _method: string;
    readonly method: string;
    isReady: boolean;
    constructor(ctx: HttpContext, method: string);
    _execute_(method: string): Promise<void>;
    create(ctx: HttpContext, method: string): void;
    static extend(oPar: {}): constructorOf<WebService>;
}
