
import { HttpVerb } from "../../http";
import { RouteType } from "../router";
import { Search, State } from "../searching";
import { RoutingState } from "../static/route_search";
import { AsyncRouteNode } from "./asyncRouter";

export abstract class AsyncSearch<S extends State<any, any>> extends Search<S> {
    public async reset(): Promise<void> {
        this.nodes.clear();
        this.nodes.addAll(await this.initial());
    }

    public async first(): Promise<S> {
        await this.reset();
        return this.next();
    }

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

    protected abstract async initial(): Promise<S[]>;

    protected abstract async move(state: S): Promise<S[]>;

    protected abstract goal(state: S): boolean;
}

export class AsyncRoutingState<T> extends RoutingState<AsyncRouteNode<T>> {
    public leafs: HttpVerb = 0;

    public clone(): this {
        let s = super.clone() as this;
        s.leafs = this.leafs;
        return s;
    }
}

export class AsyncRouteSearch<T> extends AsyncSearch<AsyncRoutingState<T>> {
    public verb: HttpVerb;

    public async getPossibleRoutes(from: AsyncRouteNode<T>, next: string, rest: string): Promise<AsyncRouteNode<T>[]> {
        throw new Error("Method not implemented.");
    }

    public async initial(): Promise<AsyncRoutingState<T>[]> {
        throw new Error("Method not implemented.");
    }

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

    public goal(state: AsyncRoutingState<T>): boolean {
        return state.left.length === 0 && (state.leafs & this.verb)  !== 0;
    }


}
