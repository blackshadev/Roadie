/// <reference types="node" />
import { Readable } from "stream";
export declare enum ReaderState {
    none = 0,
    reading = 1,
    done = 2,
}
export declare class BufferReader {
    readonly buffer: Buffer;
    readonly length: number;
    state: ReaderState;
    protected _stream: Readable;
    private _buffer;
    private _iX;
    constructor(contentLength: number, strm: Readable);
    read(cb: (data: Buffer) => void): void;
}
