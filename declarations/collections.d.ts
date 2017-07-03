export interface IValueOf {
    valueOf(): number;
}
export declare class SortedArray<T extends IValueOf> {
    protected _items: T[];
    readonly items: T[];
    readonly length: number;
    constructor(items?: T[]);
    search(item: T): number;
    add(item: T): number;
    addAll(items: T[]): void;
    getItem(idx: number): T;
    clear(): void;
}
export interface IConstructorOf<T> {
    new (...rest: any[]): T;
}
export declare class Map<K, V> {
    private items;
    constructor();
    set(key: K, value: V): void;
    get(key: K): V;
    protected key(key: K): string;
}
export interface IDictionary<V> {
    [key: string]: V;
}
export interface IDeferedPromise<T> {
    promise: Promise<T>;
    resolve: (d: T) => void;
    reject: (err: Error) => void;
}
export declare function deferPromise<T>(): IDeferedPromise<T>;
