/** Server.js
 *  Author: Vincent Hagen
 *
 *  The Junction Server.
 */
var $o = require("./core.js");
var RouteMap = require('./Routing.js').RouteMap;
var Resource = require("./Resource.js").Resource;
var Http = require("./Http.js");
var http = require("http");
var net = require("net");
var path = require("path");

module.exports = (function($o) {

    // Server which serves the content
    var Server = $o.Object.extend({
        port: 8080, // port to listen to
        routemap: null, // Reference to the RouteMap
        root: "./scripts/", // root for all routes
        
        isPaused: false, // Boolean to keep track whenever the server is paused
        queue: null,  // When paused, queue all Contexts in a queue

        _root: "", // proccess cwd relative to the junction dir
        _routes: null, // Backup of all routes set via addRoute(a) 
        // handles
        onCreate: function() {},
        onStart: function() {},
        create: function(oPar) {
            this._root = path.relative(__dirname, process.cwd());
            var r = oPar.root || this.root;
            this.root = (r[0] === ".") ? path.join(this._root, r) : path.relative(__dirname, r);

            this.port = oPar.port || this.port;
            this.configPort = oPar.configPort || this.configPort;
            this.localConfigOnly = oPar.localConfigOnly || this.localConfigOnly;

            var h = this.handleRequest.bind(this);

            this.server = http.createServer(h);
            
            this._routes = [];

            this.routemap = new RouteMap();
            this.queue = [];

            this.onCreate();
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
            var ctx = new Http.HttpContext(this, req, res);

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
                ctx.response.send();
                return;
            }

            console.log("[Server] foundResource:" + ctx.foundResource);
            
            var res = Resource.create(this.root + ctx.foundResource);
            res.run(ctx);
        },
        // Starts the server
        start: function() {
            console.log("Stated listening on port " + this.port);
            this.server.listen(this.port);

            this.onStart();
        },
        // Reloads both all resources and routemaps
        reload: function() {
            this.pause();

            this.routemap.clear();
            this.addRoutes(this._routes, true);

            Resource.reloadAll();
            
            this.resume();
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
                var fname = require.resolve(this._root + "\\" + a);
                if(!fname) console.log("[Routes] can't find file " + a);

                if(!reload) this._routes.push(a);
                else delete require.cache[fname];

                var json = require(fname);
    
                this.routemap.load(json);

            // json
            } else if(typeof(a) === "object") {
                if(!reload) this._routes.push(a);

                this.routemap.load(a);
            }
        },
        listResources: function() { return Resource.list(); },
        listRoutes: function() { return this.routemap.list(); }
    });


    return { Server: Server };
})($o);