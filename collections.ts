"use strict";

export interface IValueOf {
    valueOf(): number;
}

export class SortedArray<T extends IValueOf> {
    

    protected _items: T[];
    
    get items(): T[] { return this._items; }
    get length(): number { return this._items.length; }

    constructor(items?: T[]) {
        
        if (items) {
            items.sort((a: T, b: T) => { return a.valueOf() - b.valueOf() });
            this._items = items;
        } else
            this._items = [];
        
    }
    

    /**  Use binary search and given item, returns the index within the array
         When the exact value is not present it returns the index where the
         given value sould be inserted -- the last index where the given value
         is lower than the item's.
     * @param item item to search for.
     * @returns  the index within the array where the last index where the given value is lower than the item's
     */
    search(item: T) : number {
        const k = item.valueOf();
        let val = item.valueOf();

        let a = this._items;
        let l = 0, h = a.length - 1;
        let m: number,
            v: number;

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
    
    /**
     * Adds a item to the sorted array
     * @param item Item to add in the sorted array
     */
    add(item: T) : number {
        let idx = this.search(item);
        this._items.splice(idx, 0, item);

        return idx;
    }

    addAll(items: T[]): void {
        for (let i = 0; i < items.length; i++)
            this.add(items[i]);
    }

    getItem(idx: number): T {
        return this._items[idx];
    }

    clear(): void {
        this._items.length = 0;
    }
}



/**
 * Own Map class
 */
export class Map<K, V> {
    private items: { [name: string]: V };

    protected key(key: K): string { return key.toString(); }

    constructor() {
        this.items = {};
    }

    set(key: K, value: V): void {
        this.items[this.key(key)] = value;
    }

    get(key: K): V {
        return this.items[this.key(key)];
    }

}

export interface IDictionary<V> { [key: string]: V }

export let extend: (target: {}, source: {}) => {};
extend = (<any>Object).assign;
if (!extend) {
    extend = function (target: {}, source: {}): {} {
        for (let k in source) {
            target[k] = source[k];
        }

        return target;
    };
}