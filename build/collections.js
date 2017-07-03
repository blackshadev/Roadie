"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SortedArray {
    constructor(items) {
        if (items) {
            items.sort((a, b) => a.valueOf() - b.valueOf());
            this._items = items;
        }
        else {
            this._items = [];
        }
    }
    get items() { return this._items; }
    get length() { return this._items.length; }
    search(item) {
        const k = item.valueOf();
        const val = item.valueOf();
        const a = this._items;
        let l = 0;
        let h = a.length - 1;
        let m;
        let v;
        while (l <= h) {
            m = (l + h) >> 1;
            v = a[m].valueOf();
            if (v < val) {
                l = m + 1;
            }
            else if (v > val) {
                h = m - 1;
            }
            else {
                return m;
            }
        }
        return l;
    }
    add(item) {
        const idx = this.search(item);
        this._items.splice(idx, 0, item);
        return idx;
    }
    addAll(items) {
        for (const item of items) {
            this.add(item);
        }
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
    set(key, value) {
        this.items[this.key(key)] = value;
    }
    get(key) {
        return this.items[this.key(key)];
    }
    key(key) { return key.toString(); }
}
exports.Map = Map;
function deferPromise() {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return { resolve, reject, promise };
}
exports.deferPromise = deferPromise;
//# sourceMappingURL=collections.js.map