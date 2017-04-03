"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SortedArray {
    constructor(items) {
        if (items) {
            items.sort((a, b) => { return a.valueOf() - b.valueOf(); });
            this._items = items;
        }
        else
            this._items = [];
    }
    get items() { return this._items; }
    get length() { return this._items.length; }
    search(item) {
        const k = item.valueOf();
        let val = item.valueOf();
        let a = this._items;
        let l = 0, h = a.length - 1;
        let m, v;
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
    }
    add(item) {
        let idx = this.search(item);
        this._items.splice(idx, 0, item);
        return idx;
    }
    addAll(items) {
        for (let i = 0; i < items.length; i++)
            this.add(items[i]);
    }
    getItem(idx) {
        return this._items[idx];
    }
    clear() {
        this._items.length = 0;
    }
}
exports.SortedArray = SortedArray;
class Map {
    constructor() {
        this.items = {};
    }
    key(key) { return key.toString(); }
    set(key, value) {
        this.items[this.key(key)] = value;
    }
    get(key) {
        return this.items[this.key(key)];
    }
}
exports.Map = Map;
exports.extend = Object.assign;
if (!exports.extend) {
    exports.extend = function (target, source) {
        for (let k in source) {
            target[k] = source[k];
        }
        return target;
    };
}
//# sourceMappingURL=collections.js.map