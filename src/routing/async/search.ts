import { HttpVerb } from "../../http";
import { RouteType } from "../router";
import { Search, State } from "../searching";
import { RoutingState } from "../static/route_search";
import { AsyncRouteNode } from "./asyncRouteNode";
import { constructorOf } from "../../collections";

/**
 * Asynchronous search
 */
export abstract class AsyncSearch<S extends State<any, any>> extends Search<S> {
    /**
     * Resets the search by clearing the node list and adding the root nodes
     */
    public async reset(): Promise<void> {
        this.nodes.clear();
        this.nodes.addAll(await this.initial());
    }

    /**
     * Fetches the first search reset by resetting the search and finding the next result
     */
    public async first(): Promise<S> {
        await this.reset();
        return this.next();
    }

    /**
     * Fetches the next search result
     */
    public async next(): Promise<S|undefined> {
        while (this.nodes.length > 0) {
            const state = this.nodes.items.shift();

            // Is goal state?
            if (this.goal(state)) {
                return state;
            }

            const arr = await this.move(state);

            // Add the new states to our possible moves
            this.nodes.addAll(arr);
        }

        // no more states
        return;
    }

    /**
     * Fetches the initial state
     */
    protected abstract async initial(): Promise<S[]>;

    /**
     * Moves from one state to the next possible states
     * @param state State to move from
     * @returns Next possible states
     */
    protected abstract async move(state: S): Promise<S[]>;

    /**
     * Indicates whenever given node is a goal state of not
     * @param state State to decide if it is a goal or not
     */
    protected abstract goal(state: S): boolean;
}

/**
 * A singular routing state
 */
export class AsyncRoutingState<T> extends RoutingState<AsyncRouteNode<T>> {
    public leafs: HttpVerb = 0;

    /**
     * Clones the state
     */
    public clone(): this {
        let s = super.clone() as this;
        s.leafs = this.leafs;
        return s;
    }
}

/**
 * Search implementation for the asynchronous routes
 */
export class AsyncRouteSearch<T> extends AsyncSearch<AsyncRoutingState<T>> {
    public verb: HttpVerb;

    /**
     * Retrieve the possible routes from the given route node
     * @param from Source route node to navigate from
     * @param next The next part of the route so search
     * @param rest The leftover/tail of the route
     */
    public async getPossibleRoutes(
        from: AsyncRouteNode<T>,
        next: string,
        rest: string,
    ): Promise<AsyncRouteNode<T>[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the initial / start state
     */
    public async initial(): Promise<AsyncRoutingState<T>[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * Moves from one route state to the next possible states
     * @param s State to move from
     */
    public async move(s: AsyncRoutingState<T>): Promise<AsyncRoutingState<T>[]> {

        const n = s.left.shift();
        const rest = s.left.length ? n + "/" + s.left.join("/") : n;

        if (n === undefined) {
            return [];
        }

        const arr = await this.getPossibleRoutes(s.data, n, rest);

        const states = arr.map((e) => {
            // s = state, ns= newstate
            const ns = s.clone();
            ns.data = e;
            ns.leafs = e.leafs;
            ns.path.push(e.name);

            switch (e.type) {
                case RouteType.parameter:
                    ns.penalty += 1;
                    ns.params[e.name] = n;
                    break;
                case RouteType.wildcard:
                    ns.uri = rest;
                    ns.penalty += ns.uri.length - (e.name.length - 1);
                    ns.left.length = 0;
                    break;
                default: break;
            }

            // Route debugging
            // console.log(sprintf('[Routing] %-25s: %s', ns.path.join("/"), ns.penalty));

            return ns;
        });

        return states;
    }

    /**
     * Indicate a goal state, namely a state with no url parts left and the verb bound to it
     * @param state State to check as a goal state
     */
    public goal(state: AsyncRoutingState<T>): boolean {
        return state.left.length === 0 && (state.leafs & this.verb)  !== 0;
    }


}
