import * as assert from "assert";
import { HttpVerb } from "../http";
import {
    AsyncParameterNode,
    AsyncRootNode,
    AsyncRouteNode,
    AsyncStaticNode,
    AsyncWildcardNode,
} from "../routing/async/asyncRouteNode";
import {
    AsyncRouter,
} from "../routing/async/asyncRouter";
import { IRoutingResult, RouteType } from "../routing/router";

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
            return [new AsyncRootNode({
                data: routes["/"],
            })];
        };
        r.getResource = async (d) => {
            return d.data as any;
        };

        r.getRouteChildren = async (n: AsyncRouteNode<{ [r: string]: any }>) => {
            return Object.keys(n.data).map((k) => {
                const val = n.data[k];
                const leafs = typeof(val) === "number" ? HttpVerb.GET : 0;
                let type: RouteType;

                if (k.indexOf("*") > -1) {
                    type = RouteType.wildcard;
                } else if (k[0] === "{") {
                    type = RouteType.parameter;
                    k = k.substr(1, k.length - 2);
                } else {
                    type = RouteType.static;
                }

                return AsyncRouteNode.Create<{ [r: string]: any }>(
                    type,
                    {
                        data: val,
                        name: k,
                        leafs,
                    },
                );
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

        res = await r.getRoute("/test/statics/sub/dir/index.html", HttpVerb.GET);
        assert.equal(res.resource, 12);
        assert.equal(res.uri, "sub/dir/index.html");

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
