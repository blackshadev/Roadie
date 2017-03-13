import { Readable } from 'stream';
export declare enum ReaderState {
    none = 0,
    reading = 1,
    done = 2,
}
export declare class BufferReader {
    protected _stream: Readable;
    private _buffer;
    readonly buffer: Buffer;
    readonly length: number;
    private _iX;
    state: ReaderState;
    constructor(contentLength: number, strm: Readable);
    read(cb: (data: Buffer) => void): void;
}
