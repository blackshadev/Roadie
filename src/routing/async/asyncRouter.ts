import { parse } from "url";
import { Endpoint } from "../../endpoints";
import { HttpVerb } from "../../http";
import { IRouter, IRoutingResult, RouteType } from "../router";
import { escapeRegex, Route } from "../static/routemap";
import { AsyncRootNode, AsyncRouteNode } from "./asyncRouteNode";
import { AsyncRouteSearch, AsyncRoutingState } from "./search";

/**
 * Async router, routes given route through an async search tree
 * @remarks the following functions should be overridden:
 *          getRoot, getRouteChildren, addRoute, getResource
 */
export class AsyncRouter<T> implements IRouter {

    /**
     * Retrieves the rootnode bound to a given hostname
     * @param hostname Hostname to use and find the rootnode of
     */
    public async getRoot(hostname: string): Promise<AsyncRouteNode<T>> {
        return new AsyncRootNode<T>();
    }

    /**
     * Retrieves the route's children
     * @param n Node to retrieve the children of.
     */
    public async getRouteChildren(
        n: AsyncRouteNode<T>,
    ): Promise<AsyncRouteNode<T>[]>  {
        throw new Error("Method not implemented.");
    }

    /**
     * Adds a route to the async router
     * @param url URL to add
     * @param endpoint Endpoint bound to it
     */
    public async addRoute(url: string, endpoint: Endpoint<any, any>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    /**
     * Gets an endpoint of the given Route Node
     * @param node Route node to use.
     * @param verb Verb of the endpoint to bind.
     */
    public async getResource(node: T, verb: HttpVerb): Promise<Endpoint<any, any>> {
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the routing result of the given url and verb
     * @param url URL to find the route of
     * @param verb HTTP Verb to use
     */
    public async getRoute(url: string, verb: HttpVerb, hostname?: string): Promise<IRoutingResult> {
        url = Route.normalizeURL(url);

        let search = new AsyncRouteSearch<T>();
        search.verb = verb;
        search.initial = async () => {
            const root = await this.getRoot(hostname);
            let node = new AsyncRoutingState<T>(root);
            node.left = url.length ? url.split("/") : [];
            return [node];
        };
        search.getPossibleRoutes = async (
            from: AsyncRouteNode<T>,
            next: string,
            rest: string
        ): Promise<AsyncRouteNode<T>[]>  => {
            const all = await this.getRouteChildren(from);
            const filtered = all.filter((n) => n.match(next, rest));
            return filtered;
        };
        let res = await search.first();

        if (!res) {
            return { path: null, resource: null, uri: null, params: {} };
        }

        return {
            params: res.params,
            path: res.path,
            resource: await this.getResource(res.data.data, verb),
            uri: res.uri,
        };
    }
}
