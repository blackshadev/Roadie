﻿import assert = require('assert');
import { WebService } from '../webservice';
import { HttpContext, RoadieServer, WebMethod, HttpVerb } from '../http';
import { WebMethodEndpoint } from '../endpoints';

import { constructorOf } from '../collections';
import { RouteMap } from '../routemap';


class NewWebservice extends WebService {
    
    extraProp: boolean;

    constructor(ctx: HttpContext, method: string) {
        super(ctx, method);
        this.isReady = false;
        this.extraProp = true;
    }

    test() {
        this.ctx.response.data("New Test Webservice");
        this.ctx.response.send();
    }
}

declare const _super: (o: constructorOf<WebService>) => WebService;

describe("Webservice", () => {

    it("extending old", () => {
        let constructed = false;
        let svc = WebService.extend({
            create: function (ctx: HttpContext, method: string) {
                constructed = true;
                _super(svc).create.call(this, ctx, method);
            },
            test: function () {
                this.ctx.response.data("Test Webservice");
                this.ctx.response.send();
            }

        });


        let test = new svc({}, "testMethod");

        assert.ok(constructed, "Did not go through the create fn");
        assert.ok((<any>test).test, "Doesn't have the newly added method");
        assert.ok((<any>test)._method === "testMethod", "method not set properly");


    });

    it("extending ts", () => {
        let test = new NewWebservice(<any>{}, "test");
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
            halloworld() {
                this.ctx.response.data("Hallo World");
                this.ctx.response.send();
            }
        }
        

        const routemap = <RouteMap>(<any>serv)._routemap;
        assert.ok(
            true
            && routemap.routes["ha"]
            && routemap.routes["ha"].routes["lo"]
            && routemap.routes["ha"].routes["lo"].endpoints.get(HttpVerb.GET)
            , "Route not found"
        );

        const endp = routemap.routes["ha"].routes["lo"].endpoints.get(HttpVerb.GET)
        assert.ok(
            true
            && endp instanceof WebMethodEndpoint
            && (<WebMethodEndpoint<any>>endp).method === "halloworld"
            && (<WebMethodEndpoint<any>>endp).script === WebSvc.prototype.constructor
            , "Invalid endpoint"
        );

    });

});