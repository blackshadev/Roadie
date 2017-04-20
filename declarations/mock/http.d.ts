/// <reference types="node" />
import { HttpContext } from "../http";
import { IRoutingResult } from "../routing/router";
export interface IMockContextParams {
    url: string;
    method?: string;
    headers?: {
        [headername: string]: string;
    };
    body?: string | Buffer;
    server?: {
        cwd?: string;
        onError: Function;
    };
    route?: Partial<IRoutingResult>;
}
export declare function createMockContext(oPar: IMockContextParams): HttpContext;
