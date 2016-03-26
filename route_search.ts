import { State, GreedySearch } from "./searching";
import { RouteType, Route, RouteMap } from "./routemap";
import { HttpVerb } from "./http";
import { extend } from "./collections";


export class RoutingState extends State<string, Route> {
    penalty: number = 0;
    
    // Collected parameters
    params: { [name: string]: any } = [];

    // Collects wildcard leftovers
    uri: string = "";

    get cost(): number { return this.path.length + this.penalty; }

    // Get Possible routes to take from this state
    getPossibleRoutes(part, rest): Route[] {
        let arr: Route[] = [];
        for (let k in this.data.routes) {
            if (this.data.routes[k].match(part, rest))
                arr.push(this.data.routes[k]);
        }

        return arr;
    }

    clone(): RoutingState {
        let s = new RoutingState(this.data);
        s.left = this.left.slice(0);
        s.path = this.path.slice(0);
        s.penalty = this.penalty;
        s.uri = this.uri;
        s.params = extend({}, this.params);

        return s;
    }
}

export class RouteSearch extends GreedySearch<RoutingState> {
    RouteMap: RouteMap;
    urlParts: string[];
    verb: HttpVerb;

    constructor(rm: RouteMap, urlParts: string[], verb: HttpVerb) {
        super();
        this.RouteMap = rm;
        this.urlParts = urlParts;
        this.verb = verb;
    }

    goal(s: RoutingState): boolean {
        return s.left.length === 0 && (this.verb === undefined || !!s.data.endpoints.get(this.verb));
    }

    initial(): RoutingState[] {
        let s = new RoutingState(this.RouteMap.root);
        s.left = this.urlParts;

        return [s];
    }

    move(s: RoutingState): RoutingState[] {

        var r = s.data;
        var n = s.left.shift();
        var rest = s.left.length ? n + "/" + s.left.join("/") : n;

        var arr = s.getPossibleRoutes(n, rest);

        var self = this;
        var states = arr.map(function (e) {
            // s = state, ns= newstate
            var ns = s.clone();
            ns.data = e;
            ns.path.push(e.name);

            switch (e.type) {
                case RouteType.parameter:
                    ns.penalty += 1;
                    ns.params[e.name] = n;
                    break;
                case RouteType.wildcard:
                    ns.uri = rest;
                    ns.penalty += ns.uri.length - (e.name.length - 1)
                    ns.left.length = 0;
                    break;
            }
                        
            // Route debugging
            // console.log(sprintf('[Routing] %-25s: %s', ns.path.join("/"), ns.penalty));
                        
            return ns;
        });

        return states;

    }
}