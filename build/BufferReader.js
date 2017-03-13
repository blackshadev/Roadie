"use strict";
var ReaderState;
(function (ReaderState) {
    ReaderState[ReaderState["none"] = 0] = "none";
    ReaderState[ReaderState["reading"] = 1] = "reading";
    ReaderState[ReaderState["done"] = 2] = "done";
})(ReaderState = exports.ReaderState || (exports.ReaderState = {}));
class BufferReader {
    constructor(contentLength, strm) {
        this._iX = 0;
        this.state = ReaderState.none;
        contentLength = isNaN(contentLength) ? 0 : contentLength;
        this._buffer = new Buffer(contentLength);
        this._stream = strm;
    }
    get buffer() { return this._buffer; }
    get length() { return this._buffer.length; }
    read(cb) {
        switch (this.state) {
            case ReaderState.none:
                this.state = ReaderState.reading;
                this._stream.on("end", () => this.state = ReaderState.done);
                this._stream.on("data", (chk) => {
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
exports.BufferReader = BufferReader;
//# sourceMappingURL=BufferReader.js.map