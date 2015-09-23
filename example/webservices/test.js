"use strict";

var $r = require("../../roadie.js");    

module.exports = $r.WebService.extend({
       
    // Accessible in the example by /test/hallo/world/
    halloworld: function() {
        this.ctx.response.data("HalloWorld");
        this.ctx.response.send();
    },
    // Accessible in the example by /test/{id}/
    paramExample: function() {
        this.ctx.response.data("<h1>Below a list of your route params</h1>");
        var p  = this.ctx.request.parameters;
        // List all parameters
        for(var k in p) 
            this.ctx.response.append(k + ": " + p[k] + "<br />");
        
        this.ctx.response.send();
    },
    // Accessible in the example by /test/json/
    getJson: function() {
        var p = this.ctx.request.parameters;
        this.ctx.response.header("Content-Type", "application/json");
        this.ctx.response.data({"hallo": "world", "params": p});
        this.ctx.response.send();
    },
    // Accessible in the example by /test/error/
    error: function() {
        var err = new $r.HttpError(403, "You will not pass!");
        this.ctx.error(err);
    },
    fatal: function() { throw new Error("Fatal error"); },
    // Accessible in example by /test/ with the post request
    post: function() {
        var ctx = this.ctx;
        ctx.response.data("I got: <br />");

        this.request.body(function(dat) {
            ctx.response.append(dat);
            ctx.response.send();
        });
    },
    
    cust_dat: function() {
        this.ctx.response.data(this.ctx.resource.data);
        this.ctx.response.send();
    }
});