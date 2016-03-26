"use strict";
(function (ReaderState) {
    ReaderState[ReaderState["none"] = 0] = "none";
    ReaderState[ReaderState["reading"] = 1] = "reading";
    ReaderState[ReaderState["done"] = 2] = "done";
})(exports.ReaderState || (exports.ReaderState = {}));
var ReaderState = exports.ReaderState;
var BufferReader = (function () {
    function BufferReader(contentLength, strm) {
        this._iX = 0;
        this.state = ReaderState.none;
        contentLength = isNaN(contentLength) ? 0 : contentLength;
        this._buffer = new Buffer(contentLength);
        this._stream = strm;
    }
    Object.defineProperty(BufferReader.prototype, "buffer", {
        get: function () { return this._buffer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferReader.prototype, "length", {
        get: function () { return this._buffer.length; },
        enumerable: true,
        configurable: true
    });
    BufferReader.prototype.read = function (cb) {
        var _this = this;
        switch (this.state) {
            case ReaderState.none:
                this.state = ReaderState.reading;
                this._stream.on("end", function () { return _this.state = ReaderState.done; });
                this._stream.on("data", function (chk) {
                    var readSize = Math.min(chk.length, _this._buffer.length - _this._iX);
                    chk.copy(_this._buffer, _this._iX, 0, readSize);
                    _this._iX += readSize;
                });
            case ReaderState.reading:
                this._stream.on("end", function () { return cb(_this._buffer); });
                break;
            case ReaderState.done:
                setTimeout(function () { return cb(_this._buffer); });
                break;
        }
    };
    return BufferReader;
}());
exports.BufferReader = BufferReader;
//# sourceMappingURL=BufferReader.js.map