
/**
 * A Route node interface
 */
import { HttpVerb } from "../../http";
import { RouteType } from "../router";
import { escapeRegex } from "../static/routemap";

export interface IRoute<T> {
    // Route type
    type: RouteType;
    // User data
    data: T;
}

/**
 * Parameters for the async route
 */
export interface IAsyncNodeParams<T> {
    // Name of the route / path part
    name?: string;
    // User data bound to the route
    data?: T;
    // Available HTTPVerbs bound to it
    leafs?: HttpVerb;
}

/**
 * Async Route node
 */
export abstract class AsyncRouteNode<T> implements IRoute<T> {

    /**
     * Factory function for creating route nodes
     * @param type Type of route to create
     * @param oPar Parameters for the node
     */
    public static Create<T>(
        type: RouteType,
        oPar: IAsyncNodeParams<T>,
    ): AsyncRouteNode<T> {
        switch (type) {
            case RouteType.parameter: return new AsyncParameterNode<T>(oPar);
            case RouteType.root:      return new AsyncRootNode<T>(oPar);
            case RouteType.static:    return new AsyncStaticNode<T>(oPar);
            case RouteType.wildcard:  return new AsyncWildcardNode<T>(oPar);
            default: throw new Error("No such RouteType found");
        }
    }

    /** Type of the route */
    public readonly type: RouteType = RouteType.unknown;
    /** User data bound to the route */
    public readonly data: T;
    /** Node is an endpoint */
    public readonly leafs: HttpVerb;
    /** Route name */
    public readonly name: string;

    constructor(oPar: IAsyncNodeParams<T> = {}) {
        this.name = oPar.name || "";
        this.data = oPar.data;
        this.leafs = oPar.leafs || 0;
    }

    public abstract match(n: string, rest: string): boolean;
}

/**
 * Async root route node
 */
export class AsyncRootNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.root;

    public match(n: string, rest: string): boolean {
        return true;
    }
}

/**
 * Async parameter route node
 */
export class AsyncParameterNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.parameter;

    public match(n: string, rest: string): boolean {
        return true;
    }
}

/**
 * Async wildcard node
 */
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

/**
 * Async static route node
 */
export class AsyncStaticNode<T> extends AsyncRouteNode<T> {
    public readonly type: RouteType = RouteType.static;

    public match(n: string, rest: string): boolean {
        return this.name === n;
    }
}
