import { Readable } from 'stream'
import { EventEmitter } from "events"

export enum ReaderState {
    none,
    reading,
    done
}

export class BufferReader {
    protected _stream: Readable;

    private _buffer: Buffer;
    get buffer(): Buffer { return this._buffer; }
    get length(): number { return this._buffer.length; }
    
    private _iX: number = 0;

    state: ReaderState = ReaderState.none;

    constructor(contentLength: number, strm: Readable) {
        contentLength = isNaN(contentLength) ? 0 : contentLength;
        this._buffer = new Buffer(contentLength);

        this._stream = strm;

    }

    read(cb: (data: Buffer) => void): void {

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