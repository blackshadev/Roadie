import { IValueOf, SortedArray } from "../collections";
export declare class State<P, T> implements IValueOf {
    readonly cost: number;
    path: P[];
    left: P[];
    data: T;
    constructor(data: T, left?: P[]);
    clone(): State<P, T>;
    valueOf(): number;
}
export declare abstract class Search<S extends State<any, any>> {
    readonly nodes: SortedArray<S>;
    constructor();
    abstract reset(): void | Promise<void>;
    abstract first(): S | Promise<S | undefined> | undefined;
    abstract next(): S | Promise<S | undefined> | undefined;
    protected abstract initial(): S[] | Promise<S[]>;
    protected abstract move(state: S): S[] | Promise<S[]>;
    protected abstract goal(state: S): boolean | Promise<boolean>;
}
export declare abstract class GreedySearch<S extends State<any, any>> extends Search<S> {
    reset(): void;
    first(): S | undefined;
    next(): S | undefined;
    protected abstract move(state: S): S[];
    protected abstract goal(state: S): boolean;
    protected abstract initial(): S[];
}
