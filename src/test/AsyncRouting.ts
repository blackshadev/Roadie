import * as assert from "assert";
import { HttpVerb } from "../http";
import {
    AsyncParameterNode,
    AsyncRootNode,
    AsyncRouteNode,
    AsyncRouter,
    AsyncStaticNode,
    AsyncWildcardNode,
} from "../routing/async/asyncRouter";
import { IRoutingResult } from "../routing/router";

describe("AsyncRouter", () => {
    const routes = {
        "/": {
            "test": {
                "statics": {
                    "*.html": 12,
                },
                "test2": 5,
                "{prop}": -1,
            },
            "{er}": 1,
        },
    };

    it("Combined", async () => {

        let r = new AsyncRouter<{ [r: string]: any }>();
        r.getRoot = async () => {
            return new AsyncRootNode({
                data: routes["/"],
            });
        };
        r.getResource = async(d) => {
            return d;
        }

        r.getRouteChildren = async (n: AsyncRouteNode<{ [r: string]: any }>) => {
            return Object.keys(n.data).map((k) => {
                let val = n.data[k];
                let leafs = typeof(val) === "number" ? HttpVerb.GET : 0;
                let node: AsyncRouteNode<{ [r: string]: any }>;

                if (k.indexOf("*") > -1) {
                    node = new AsyncWildcardNode<{ [r: string]: any }>({
                        data: val,
                        name: k,
                        leafs,
                    });
                } else if (k[0] === "{") {
                    node = new AsyncParameterNode<{ [r: string]: any }>({
                        data: val,
                        name: k.substr(1, k.length - 2),
                        leafs,
                    });
                } else {
                    node = new AsyncStaticNode<{ [r: string]: any }>({
                        data: val,
                        name: k,
                        leafs,
                    });
                }

                return node;
            });
        };

        let res: IRoutingResult;
        res = await r.getRoute("/test/test2", HttpVerb.GET);
        assert.equal(res.resource, 5);

        res = await r.getRoute("/test/aaaaa", HttpVerb.GET);
        assert.equal(res.resource, -1);
        assert.equal(res.params.prop, "aaaaa");

        res = await r.getRoute("/test/statics/index.html", HttpVerb.GET);
        assert.equal(res.resource, 12);
        assert.equal(res.uri, "index.html");

        res = await r.getRoute("/55/", HttpVerb.GET);
        assert.equal(res.resource, 1);
        assert.equal(res.params.er, "55");

        res = await r.getRoute("/test/statics/index.js", HttpVerb.GET);
        assert.equal(res.resource, null);

        res = await r.getRoute("/", HttpVerb.GET);
        assert.equal(res.resource, null);

        res = await r.getRoute("/test/statics/index.html", HttpVerb.POST);
        assert.equal(res.resource, null);

    });

});
