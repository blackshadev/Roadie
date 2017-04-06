import assert = require("assert");
import { constructorOf } from "../collections";
import { WebMethodEndpoint } from "../endpoints";
import { HttpContext, HttpVerb, RoadieServer, WebMethod } from "../http";
import { StaticRouter } from "../routemap";
import { WebService } from "../webservice";

class NewWebservice extends WebService {
    public extraProp: boolean;

    constructor(ctx: HttpContext, method: string) {
        super(ctx, method);
        this.isReady = false;
        this.extraProp = true;
    }

    public test() {
        this.ctx.response.data("New Test Webservice");
        this.ctx.response.send();
    }
}

declare const _super: (o: constructorOf<WebService>) => WebService;

describe("Webservice", () => {

    it("extending old", () => {
        let constructed = false;
        const svc = WebService.extend({
            create(ctx: HttpContext, method: string) {
                constructed = true;
                _super(svc).create.call(this, ctx, method);
            },
            test() {
                this.ctx.response.data("Test Webservice");
                this.ctx.response.send();
            },
        });

        const test = new svc({}, "testMethod");

        assert.ok(constructed, "Did not go through the create fn");
        assert.ok(( test as any).test, "Doesn't have the newly added method");
        assert.ok((test as any)._method === "testMethod", "method not set properly");

    });

    it("extending ts", () => {
        const test = new NewWebservice( {} as any, "test");
        assert.ok(test.isReady === false, "isReady must be set to false by the new webservice");
        assert.ok(test.extraProp === true, "Newly added prop isn't set correctly");
        assert.ok(test.method === "test", "Method isn't set correctly");

    });

});

describe("server", () => {
    let serv: RoadieServer;

    before(() => {
        serv = new RoadieServer({ root: __dirname + "/../", webserviceDir: "webservices" });
    });

    it("Webservice decorators", () => {

        class WebSvc extends WebService {
            @WebMethod("[GET]/ha/lo", { server: serv })
            public halloworld() {
                this.ctx.response.data("Hallo World");
                this.ctx.response.send();
            }
        }

        const routemap =  (serv as any)._routemap as StaticRouter;
        assert.ok(
            true
            && routemap.routes.ha
            && routemap.routes.ha.routes.lo
            && routemap.routes.ha.routes.lo.endpoints.get(HttpVerb.GET)
            , "Route not found",
        );

        const endp = routemap.routes.ha.routes.lo.endpoints.get(HttpVerb.GET);
        assert.ok(
            true
            && endp instanceof WebMethodEndpoint
            && ( endp as WebMethodEndpoint<any>).method === "halloworld"
            && ( endp as WebMethodEndpoint<any>).script === WebSvc.prototype.constructor
            , "Invalid endpoint",
        );

    });

});
