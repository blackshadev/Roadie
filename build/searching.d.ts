import { SortedArray, IValueOf } from "./collections";
export declare class State<P, T> implements IValueOf {
    path: P[];
    left: P[];
    cost: number;
    data: T;
    constructor(data: T);
    clone(): State<P, T>;
    valueOf(): number;
}
export declare abstract class GreedySearch<S extends State<any, any>> {
    nodes: SortedArray<S>;
    constructor();
    protected abstract move(state: any): S[];
    protected abstract goal(state: any): boolean;
    protected abstract initial(): S[];
    reset(): void;
    first(): S;
    next(): S;
}
