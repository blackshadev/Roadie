import { EventEmitter } from "events";
import { Readable } from "stream";

export enum ReaderState {
    none,
    reading,
    done,
}

export class BufferReader {
    get buffer(): Buffer { return this._buffer; }
    get length(): number { return this._buffer.length; }

    public state: ReaderState = ReaderState.none;
    protected _stream: Readable;

    private _buffer: Buffer;
    private _iX: number = 0;

    constructor(contentLength: number, strm: Readable) {
        contentLength = isNaN(contentLength) ? 0 : contentLength;
        this._buffer = new Buffer(contentLength);

        this._stream = strm;

    }

    public read(cb: (data: Buffer) => void): void {

        switch (this.state) {
            case ReaderState.none:
                this.state = ReaderState.reading;
                this._stream.on("end", () => this.state = ReaderState.done);
                this._stream.on("data", (chk: Buffer) => {
                    const readSize = Math.min(chk.length, this._buffer.length - this._iX);
                    chk.copy(this._buffer, this._iX, 0, readSize);
                    this._iX += readSize;
                });
            case ReaderState.reading:
                this._stream.on("end", () => cb(this._buffer));
                break;
            case ReaderState.done:
                setTimeout(() => cb(this._buffer));
                break;
        }

    }

}
