export interface IValueOf {
    valueOf(): number;
}
export declare class SortedArray<T extends IValueOf> {
    protected _items: T[];
    items: T[];
    length: number;
    constructor(items?: T[]);
    search(item: T): number;
    add(item: T): number;
    addAll(items: T[]): void;
    getItem(idx: number): T;
    clear(): void;
}
export interface constructorOf<T> {
    new (...rest: any[]): T;
}
export declare class Map<K, V> {
    private items;
    protected key(key: K): string;
    constructor();
    set(key: K, value: V): void;
    get(key: K): V;
}
export interface IDictionary<V> {
    [key: string]: V;
}
export declare let extend: (target: {}, source: {}) => {};
