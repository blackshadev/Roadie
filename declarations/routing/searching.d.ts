import { IValueOf, SortedArray } from "../collections";
export declare class State<P, T> implements IValueOf {
    readonly cost: number;
    path: P[];
    left: P[];
    data: T;
    constructor(data: T);
    clone(): State<P, T>;
    valueOf(): number;
}
export declare abstract class GreedySearch<S extends State<any, any>> {
    nodes: SortedArray<S>;
    constructor();
    reset(): void;
    first(): S;
    next(): S;
    protected abstract move(state: any): S[];
    protected abstract goal(state: any): boolean;
    protected abstract initial(): S[];
}
