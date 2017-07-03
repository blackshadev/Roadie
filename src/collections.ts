export interface IValueOf {
    valueOf(): number;
}

export class SortedArray<T extends IValueOf> {

    protected _items: T[];

    get items(): T[] { return this._items; }
    get length(): number { return this._items.length; }

    constructor(items?: T[]) {

        if (items) {
            items.sort((a: T, b: T) => a.valueOf() - b.valueOf());
            this._items = items;
        } else {
            this._items = [];
        }

    }

    /**  Use binary search and given item, returns the index within the array
     *   When the exact value is not present it returns the index where the
     *   given value sould be inserted -- the last index where the given value
     *   is lower than the item's.
     * @param item item to search for.
     * @returns  the index within the array where the last index where the given value is lower than the item's
     */
    public search(item: T): number {
        const k = item.valueOf();
        const val = item.valueOf();

        const a = this._items;
        let l = 0;
        let h = a.length - 1;
        let m: number;
        let v: number;

        while (l <= h) {
            m = (l + h) >> 1;
            v = a[m].valueOf();

            if (v < val) {
                l = m + 1;
            } else if (v > val) {
                h = m - 1;
            } else {
                return m;
            }
        }

        return l;
    }

    /**
     * Adds a item to the sorted array
     * @param item Item to add in the sorted array
     */
    public add(item: T): number {
        const idx = this.search(item);
        this._items.splice(idx, 0, item);

        return idx;
    }

    public addAll(items: T[]): void {
        for (const item of items) {
            this.add(item);
        }
    }

    public getItem(idx: number): T {
        return this._items[idx];
    }

    public clear(): void {
        this._items.length = 0;
    }
}

export interface IConstructorOf<T> {
    new(...rest: any[]): T;
}

/**
 * Own Map class
 */
export class Map<K, V> {
    private items: { [name: string]: V };

    constructor() {
        this.items = {};
    }

    public set(key: K, value: V): void {
        this.items[this.key(key)] = value;
    }

    public get(key: K): V {
        return this.items[this.key(key)];
    }

    protected key(key: K): string { return key.toString(); }

}

export interface IDictionary<V> { [key: string]: V; }

export interface IDeferedPromise<T> {
    promise: Promise<T>;
    resolve: (d: T) => void;
    reject: (err: Error) => void;
}

export function deferPromise<T>(): IDeferedPromise<T> {
    let resolve: (t: T) => void;
    let reject: (err: Error) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return {resolve, reject, promise};
}
