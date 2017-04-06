export interface IError {
    errno: number;
    code: string;
    description: string;
    http?: number;
}
export declare const all: IError[];
export declare const errno: {
    [errno: number]: IError;
};
export declare const code: {
    [code: string]: IError;
};
