import { extend } from "../../collections";
import { HttpVerb } from "../../http";
import { RouteType } from "../router";
import { GreedySearch, State } from "../searching";
import { Route, StaticRouter } from "./routemap";

export interface IRoutingState {
    getPossibleRoutes(part, rest): Route[];
}

export class RoutingState<T> extends State<string, T> {
    public penalty: number = 0;

    // Collected parameters
    public params: { [name: string]: any } = [];

    // Collects wildcard leftovers
    public uri: string = "";

    get cost(): number { return this.path.length + this.penalty; }

    public clone(): this {
        const s = new (Object.getPrototypeOf(this).constructor)(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = Object.assign({}, this.params);

        return s;
    }
}

export class StaticRoutingState extends RoutingState<Route> {

    // Get Possible routes to take from this state
    public getPossibleRoutes(part, rest): Route[] {
        const arr: Route[] = [];
        for (const k in this.data.routes) {
            if (this.data.routes[k].match(part, rest)) {
                arr.push(this.data.routes[k]);
            }
        }

        return arr;
    }

    public clone(): this {
        return super.clone() as this;
    }
}

export class RouteSearch extends GreedySearch<StaticRoutingState> {
    public routeMap: StaticRouter;
    public urlParts: string[];
    public verb: HttpVerb;

    constructor(rm: StaticRouter, urlParts: string[], verb: HttpVerb) {
        super();
        this.routeMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }

    public goal(s: StaticRoutingState): boolean {
        return s.left.length === 0 && (this.verb === undefined || !!s.data.endpoints.get(this.verb));
    }

    public initial(): StaticRoutingState[] {
        const s = new StaticRoutingState(this.routeMap.root);
        s.left = this.urlParts;

        return [s];
    }

    public move(s: StaticRoutingState): StaticRoutingState[] {

        const r = s.data;
        const n = s.left.shift();
        const rest = s.left.length ? n + "/" + s.left.join("/") : n;

        const arr = s.getPossibleRoutes(n, rest);

        const states = arr.map((e) => {
            // s = state, ns= newstate
            const ns = s.clone();
            ns.data = e;
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
}
