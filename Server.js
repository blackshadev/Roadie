/** Server.js
 *  Author: Vincent Hagen
 *
 *  The Junction Server.
 */
 "use strict";
 
var $o = require("./core.js");
var RouteMap = require('./Routing.js').RouteMap;
var Resource = require("./Resource.js").Resource;
var Http  = require("./Http.js");

var http  = require("http");
var https = require("https");
var path  = require("path");
var fs    = require("fs");
var EventEmitter = require("events").EventEmitter;


var log = require("./log.js");

module.exports = (function($o) {


    // Server which serves the content
    var Server = $o.Object.extend({
        openConnections: 0,
        maxOpenConnections: 512, // will return 503 when maxOpenConnections is reached, set to -1 to do not perform the check
        port: 8080, // port to listen to
        routemap: null, // Reference to the RouteMap
        root: "", // root for all files, defaults to process.cwd()
        webserviceDir: "./scripts/", // Dir for all webservices to be in, relative to root
        
        // For ssl either provide a cert and key or a pfx
        useHttps: false,
        tlsOptions: null, // options for tls server (https)
        
        isReady : false, // Ready to start?
        isPaused: false, // Boolean to keep track whenever the server is paused
        queue: null,  // When paused, queue all Contexts in a queue

        server: null, // nodeJs http server
        _root: "", // proccess cwd relative to the junction dir
        _routes: null, // Backup of all routes set via addRoute(a) 
        _toobusy: function(){return this.maxOpenConnections > 0 && this.openConnections > this.maxOpenConnections;}, // generated function to check MaxOpenConnections 
        // handles
        onCreate: function() {},
        onStart: function() {},
        onError: function(err) { log("Error", err); },
        create: function(oPar) {
            EventEmitter.call(this);

            var r = oPar.root || this.root;
            this.root = oPar.root || process.cwd();

            this.port = oPar.port || this.port;
            this.configPort = oPar.configPort || this.configPort;
            this.localConfigOnly = oPar.localConfigOnly || this.localConfigOnly;
            this.onError = oPar.onError || this.onError;
            this.webserviceDir = oPar.webserviceDir || oPar.webServiceDir || this.webserviceDir;
            this.maxOpenConnections = oPar.maxOpenConnections || 512;

            
            this.useHttps = !!oPar.useHttps;
            this.tlsOptions = oPar.tlsOptions;

            this.createServer();
            
            this._routes = [];

            this.routemap = new RouteMap();
            this.queue = [];

            this.onCreate();
        },
        // Creates the http(s) server
        createServer: function() {
            var h = this.handleRequest.bind(this);
            var self = this;

            if(this.useHttps) {
                // Use https
                console.log("Using https");
                self.server = https.createServer(this.tlsOptions, h);
                self.isReady = true;
            } else {
                // Regular http server
                this.server = http.createServer(h);
                this.isReady = true;
            }
        },
        // Pause the server
        pause: function() { this.isPaused = true; },
        // Resume the paused server
        resume: function() {
            this.isPaused = false;

            for(var iX = 0; iX < this.queue.length; iX++)
                this.serve(this.queue[iX]);
            this.queue.length = 0;
        },
        /* Handles a incoming request 
         * req: NodeJs IncomingMessage object from the HttpServer
         * res: NodeJs OutgoingMessage object from the HttpServer
         */
        handleRequest: function(req, res) {
            this.openConnections++; // openConnections are decremented in Http.js::HttpResponse::send

            var ctx = new Http.HttpContext(this, req, res);
            if(this._toobusy())
                return ctx.error(503);


            if(this.isPaused)
                this.queue.push(ctx);
            else
                this.serve(ctx);
        },
        /* Serves the given ctx
         * ctx: HttpContext to server */
        serve: function(ctx) {
            var found = ctx.resolveUrl();

            // 404 comment not found
            if(!found) {
                ctx.error(new Http.HttpError(404));
                return;
            }

            log("Server", "foundResource: " + ctx.resource.name);
            if(!ctx.resource.isFunction) {
                var res = Resource.create(this.root + "/" + this.webserviceDir + "/" + ctx.resource.script);
                res.run(ctx);
            } else
                ctx.resource.script(ctx);
        },
        // Starts the server
        start: function() { 

            log("Server", "Stated listening on port " + this.port);
            this.server.listen(this.port);
            
            // process.on("uncaughtException", this.onError);

            this.onStart();
        },
        stop: function() {
            this.pause();
            this.routemap.clear();
            Resource.reloadAll();
            this.server.close();
        },
        // Reloads both all resources and routemaps
        reload: function() {
            this.pause();

            this.routemap.clear();
            this.addRoutes(this._routes, true);

            Resource.reloadAll();
            
            this.resume();
        },
        /* Adds a singular route with allong with custom data
         * url: url to add
         * script: Script name or function to execute
         * data: custom data to bind to the route
         */
        addRoute: function(url, script, data) {
            this.routemap.addRoute(url, script, data);
        },
        /* Adds given routes to the routemap
         * a: array like with filenames or json Objects of the routes to incl
         * reload: set to true when reloading, causes the routes not to be added to the _route */
        addRoutes: function(a, reload) {
            var self = this;
            if(Array.isArray(a))
                return a.forEach(function(e) { self.addRoutes(e, reload); });

            // file
            if(typeof(a) === "string") {
                var fname = require.resolve(this.root + "/" + a);
                if(!fname) log("Routes", "Can't find file " + a);

                if(!reload) this._routes.push(a);
                else delete require.cache[fname];

                var json = require(fname);
    
                this.routemap.load(json);

            // json
            } else if(typeof(a) === "object") {
                if(!reload) this._routes.push(a);

                this.routemap.load(a);

            // function
            } else if(typeof(a) === "function") {
                this.routemap.load(a());
            }
        },
        listResources: function() { return Resource.list(); },
        listRoutes: function() { return this.routemap.list(); }
    });


    return { Server: Server, log: log };
})($o);