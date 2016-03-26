"use strict";
var SortedArray = (function () {
    function SortedArray(items) {
        if (items) {
            items.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
            this._items = items;
        }
        else
            this._items = [];
    }
    Object.defineProperty(SortedArray.prototype, "items", {
        get: function () { return this._items; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SortedArray.prototype, "length", {
        get: function () { return this._items.length; },
        enumerable: true,
        configurable: true
    });
    SortedArray.prototype.search = function (item) {
        var k = item.valueOf();
        var val = item.valueOf();
        var a = this._items;
        var l = 0, h = a.length - 1;
        var m, v;
        while (l <= h) {
            m = (l + h) >> 1;
            v = a[m].valueOf();
            if (v < val)
                l = m + 1;
            else if (v > val)
                h = m - 1;
            else
                return m;
        }
        return l;
    };
    SortedArray.prototype.add = function (item) {
        var idx = this.search(item);
        this._items.splice(idx, 0, item);
        return idx;
    };
    SortedArray.prototype.addAll = function (items) {
        for (var i = 0; i < items.length; i++)
            this.add(items[i]);
    };
    SortedArray.prototype.getItem = function (idx) {
        return this._items[idx];
    };
    SortedArray.prototype.clear = function () {
        this._items.length = 0;
    };
    return SortedArray;
}());
exports.SortedArray = SortedArray;
var Map = (function () {
    function Map() {
        this.items = {};
    }
    Map.prototype.key = function (key) { return key.toString(); };
    Map.prototype.set = function (key, value) {
        this.items[this.key(key)] = value;
    };
    Map.prototype.get = function (key) {
        return this.items[this.key(key)];
    };
    return Map;
}());
exports.Map = Map;
exports.extend = Object.assign;
if (!exports.extend) {
    exports.extend = function (target, source) {
        for (var k in source) {
            target[k] = source[k];
        }
        return target;
    };
}
//# sourceMappingURL=collections.js.map