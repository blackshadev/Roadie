import { parse } from "url";
import { Endpoint } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult, RouteType } from "../router";
import { escapeRegex, Route } from "../static/routemap";
import { AsyncRouteSearch, AsyncRoutingState } from "./search";

export interface IRoute<T> {
    type: RouteType;
    data: T;
}

export abstract class AsyncRouteNode<T> implements IRoute<T> {
    /** Type of the route */
    public readonly type: RouteType = RouteType.unknown;
    /** User data bound to the route */
    public readonly data: T;
    /** Node is an endpoint */
    public readonly leafs: HttpVerb;
    /** Route name */
    public readonly name: string;

    constructor(oPar: { name?: string, data?: T, leafs?: HttpVerb } = {}) {
        this.name = oPar.name || "";
        this.data = oPar.data;
        this.leafs = oPar.leafs || 0;
    }

    public abstract match(n: string, rest: string): boolean;
}

export class AsyncRootNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.root;

    public match(n: string, rest: string): boolean {
        return true;
    }
}

export class AsyncParameterNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.parameter;

    public match(n: string, rest: string): boolean {
        return true;
    }
}

export class AsyncWildcardNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.wildcard;
    private readonly re: RegExp;
    constructor(oPar) {
        super(oPar);
        this.re = new RegExp("^" + escapeRegex(this.name).replace("\\*", ".*") + "$", "i");
    }

    public match(n: string, rest: string): boolean {
        return this.re.test(rest);
    }
}

export class AsyncStaticNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.static;

    public match(n: string, rest: string): boolean {
        return this.name === n;
    }
}

export class AsyncRouter<T> implements IRouter {
    public async getRoot(hostname: string): Promise<AsyncRouteNode<T>> {
        return new AsyncRootNode<T>();
    }

    public async getRouteChildren(
        n: AsyncRouteNode<T>,
    ): Promise<AsyncRouteNode<T>[]>  {
        throw new Error("Method not implemented.");
    }

    public async addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getResource(d: T): Promise<Endpoint<any, any>> {
        throw new Error("Method not implemented.");
    }

    public async getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult> {
        let parsedURL = parse(url);
        url = Route.normalizeURL(url);

        let search = new AsyncRouteSearch<T>();
        search.verb = verb;
        search.initial = async () => {
            const root = await this.getRoot(parsedURL.hostname);
            let node = new AsyncRoutingState<T>(root);
            node.left = url.length ? url.split("/") : [];
            return [node];
        };
        search.getPossibleRoutes = async (
            from: AsyncRouteNode<T>,
            next: string,
            rest: string
        ): Promise<AsyncRouteNode<T>[]>  => {
            let all = await this.getRouteChildren(from);

            return all.filter((n) => n.match(next, rest));
        };
        let res = await search.first();

        if (!res) {
            return { path: null, resource: null, uri: null, params: {} };
        }

        return {
            params: res.params,
            path: res.path,
            resource: await this.getResource(res.data.data),
            uri: res.uri,
        };
    }
}
