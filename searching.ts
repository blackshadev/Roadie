import { IValueOf, SortedArray} from "./collections";

export class State<P, T> implements IValueOf {
    get cost(): number { return this.path.length; };

    // Path of states to this state
    public path: P[];
    public left: P[];
    // user definable data, the clone function copies this by reference, watch out mutating it
    public data: T;

    constructor(data: T) {
        this.data = data;
        this.path = [];
        this.left = [];
    }

    public clone(): State<P, T> {
        let s = new State<P, T>(this.data);
        s.path = this.path.slice(0);
        s.left = this.left.slice(0);

        return s;
    }

    public valueOf(): number {
        return this.cost;
    }
}

export abstract class GreedySearch<S extends State<any, any>> {
    public nodes: SortedArray<S>;

    constructor() {
        this.nodes = new SortedArray<S>();
    }

    public reset(): void {
        this.nodes.clear();
        this.nodes.addAll(this.initial());
    }

    public first(): S {
        this.reset();
        return this.next();
    }

    public next(): S {

        while (this.nodes.length > 0) {
            let state = this.nodes.items.shift();

            // Is goal state?
            if (this.goal(state)) {
                return state;
            }

            let arr = this.move(state);

            // Add the new states to our possible moves
            this.nodes.addAll(arr);
        }

        // no more states
        return;
    }

    /**
     * Returns possible moves from given state
     * @param state State to inspect to move from
     */
    protected abstract move(state): S[];

    /**
     * Whenever a given state is a goal state
     * @param state State to inspect
     */
    protected abstract goal(state): boolean;

    /**
     * Return the initial states
     */
    protected abstract initial(): S[];
}
