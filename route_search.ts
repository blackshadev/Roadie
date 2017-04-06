import { extend } from "./collections";
import { HttpVerb } from "./http";
import { Route, RouteType, StaticRouter } from "./routemap";
import { GreedySearch, State } from "./searching";

export interface IRoutingState {
    getPossibleRoutes(part, rest): Route[];
}

export class RoutingState extends State<string, Route> {
    public penalty: number = 0;

    // Collected parameters
    public params: { [name: string]: any } = [];

    // Collects wildcard leftovers
    public uri: string = "";

    get cost(): number { return this.path.length + this.penalty; }

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

    public clone(): RoutingState {
        const s = new RoutingState(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = extend({}, this.params);

        return s;
    }
}

export class RouteSearch extends GreedySearch<RoutingState> {
    public routeMap: StaticRouter;
    public urlParts: string[];
    public verb: HttpVerb;

    constructor(rm: StaticRouter, urlParts: string[], verb: HttpVerb) {
        super();
        this.routeMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }

    public goal(s: RoutingState): boolean {
        return s.left.length === 0 && (this.verb === undefined || !!s.data.endpoints.get(this.verb));
    }

    public initial(): RoutingState[] {
        const s = new RoutingState(this.routeMap.root);
        s.left = this.urlParts;

        return [s];
    }

    public move(s: RoutingState): RoutingState[] {

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
