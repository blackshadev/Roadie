import { IConstructorOf } from "./collections";
import { HttpContext } from "./http";
export declare class WebService {
    static extend(oPar: {}): IConstructorOf<WebService>;
    isReady: boolean;
    protected ctx: HttpContext;
    protected _method: string;
    readonly method: string;
    constructor(ctx: HttpContext, method: string);
    _execute_(method: string): Promise<void>;
    create(ctx: HttpContext, method: string): void;
}
