/** Routing.js
 *  Author: Vincent Hagen
 *
 *  Implementation for the routing of urls
 */
"use strict";
var $o = require("./core.js");
var sprintf = require("sprintf").sprintf;
var Resource = require("./Resource.js").Resource;

module.exports = (function($o) {
    
    var $s = require("./Search.js");

    var parRe = /\{(\w+)\}/i

    function escapeRegex(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    var Endpoint = $o.Object.extend({
        name: "", // function or scriptname
        script: "", // script name or function
        isFunction: false,
        data: null, // user defined data
        create: function(script, data) {
            this.script = script;
            this.data = data;
            this.isFunction = typeof(script) === "function";
            this.name = this.isFunction ? "[Function]" : script;
        }
    })

    // Routing is based upon parts of the url, these are looked up in a map
    var Route = $o.Object.extend({
        name: "", // part of the routing
        parameter: null, // Parameter name
        isParameter: false, // Is this Route a parameter
        isWildcard: false, // Is this route a wildcard
        //isValid: true, // Not used?
        routes: null, // Child routes
        resources: null, // Object of { verb: resourceFile } with resources bound to this route
        _regex: null, // used if route is a wildcard to match the path
        create: function(oPar) {
            $o.extend(this, oPar);

            this.routes = {};
            this.resources = {};

            var m = parRe.exec(this.name);

            if(m) this.parameter = m[1];

            this.isParameter = !!this.parameter;

            this.isWildcard = this.name.indexOf('*') > -1;
            if(this.isWildcard) {
                var re = "^" + escapeRegex(this.name).replace("\\*", ".*") + "$";
                this._regex = new RegExp(re, 'i');
                
            }

        },
        /* Returns whenever the given urlpart matches this Route
         * urlpart: The urlpart which we need to match
         * resturl: The url left to match including urlpart */
        match: function(urlpart, resturl) {
            // Parameter can always match
            if(this.isParameter) return true;
            // Static path can match
            if(this.name === urlpart) return true;
            // wildcard match
            if(this._regex) return this._regex.test(resturl);
            
            return false 
        },
        /* Adds a resource to this route 
         * verbs: Array of HTTP verbs which are bound to fname
         * fname: The scriptname bound to this route 
         * data : Optional user data bound with the endpoint
         */
        addEndpoint: function(verbs, fname, data) {
            for(var iX = 0; iX < verbs.length; iX++) 
                this.resources[verbs[iX]] = new Endpoint(fname, data);
            
        }
    });
    
    // Availible verbs
    Route.verbs = ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS', 'HEAD', 'TRACE'];
    /* Devides a given url into segments
     * url: the url with the verb, eg [GET]/cust/11/view */
    Route.urlParts = function(url) {
        var idx = url.indexOf(']');

        // Retrieve the verbs out of the url, if none default to all verbs
        var verbs = Route.verbs.slice(0);
        if(idx > -1) {
            verbs = url.slice(1, idx).toUpperCase().split(",");
            verbs = verbs.filter(function(el) { return Route.verbs.indexOf(el) > -1; });
            url = url.slice(idx + 1);
        }

        // split the url up into parts
        url = url.toLowerCase();
        if(url[0] === '/') url = url.slice(1);
        if(url[url.length - 1] === '/') url = url.slice(0, -1);

        return [verbs, url.split('/')];
    };

    // RouteMap is the main entry for all routes and used to add en get routes
    var RouteMap = Route.extend({
        //isValid: false, // not used?
        create: function() {
            _super(RouteMap).create.apply(this, arguments);
        },
        /* Load in a json map of routes
         * json: json object as routes { url: fname }
         */
        load: function(json) {
            for(var k in json)
                this.addRoute(k, json[k]);
        },
        /* Adds a route with given url and fname
         * url: route bound to the fname
         * fname: filename of the resource bound to the url */
        addRoute: function(url, fname, data) {
            var r = this;
            var tmp = Route.urlParts(url);

            var p = tmp[1];
            var verbs = tmp[0];


            var i;

            // p[i] -> part of the routing url.
            // Traverse the routing table to the endpoint
            for(i = 0; i < p.length; i++) {
                // Route point doesnt exists, add it
                if(!r.routes[ p[i] ]) {
                    var nr =  new Route({ name: p[i] });

                    r.routes[ p[i] ] = nr;
                }
                
                r = r.routes[ p[i] ];
            }

            r.addEndpoint(verbs, fname, data);
        },
        /* Generates a search function based on given url and verb
         * url: Url to search for
         * verb: HTTP verb or null
         */
        searchRoutes: function (url, verb) {
            var parts = Route.urlParts(url)[1];
            var self = this;
            
            // Gets the possible routes taken from a given route point
            // r:       current routing context,
            // part:    one part of the url we look for
            // rest:    rest url including the part
            function getPossibleRoutes(r, part, rest) {
                var arr = [];
                
                for (var k in r.routes) {
                    if (r.routes[k].match(part, rest))
                        arr.push(r.routes[k]);
                }
                
                return arr;
            }
            
            // Search the Route with Greedy search where our path is the taken 
            // url parts the cost is the path to that state + a penalty
            // The penalty is used to enforce a ranking within the routing where
            // static urls are prefered, after that parameters 
            // and the least preffered routes are wildcards 
            return new $s.GreedySearch({
                cost: function (s) {
                    return s.path.length + s.penalty;
                },
                // Initial state
                initial: function () {
                    var s = new this.stateClass();
                    s.left = parts.slice(0);
                    s.cost = parts.length;
                    s.data = self;
                    s.penalty = 0;
                    s.params = {};
                    s.uri = ""; // contains the left over url after the wildcard
                    
                    return [s];
                },
                // Move by getting the possible routes and creating states
                move: function (s) {
                    
                    var r = s.data;
                    var n = s.left.shift();
                    var rest = s.left.length ? n + "/" + s.left.join("/") : n;
                    
                    var arr = getPossibleRoutes(r, n, rest);
                    
                    var self = this;
                    var states = arr.map(function (e) {
                        // s = state, ns= newstate
                        var ns = s.clone();
                        ns.data = e;
                        ns.path.push(e.name);
                        
                        ns.penalty = s.penalty;
                        ns.params = $o.extend({}, s.params);
                        if (e.isParameter) {
                            ns.penalty += 1;
                            ns.params[e.name.slice(1, e.name.length - 1)] = n;
                        }
                        
                        if (e.isWildcard) {
                            // Store the leftover routing
                            ns.uri = rest;
                            
                            /* Because the "left" array is emptied, we need to 
                                apply a penalty that is greater than all other
                                routes, but are less the more specific the 
                                route is. We use character count in that case.
                                A wildcard starts always with a * and the rest
                                of the string is a specific match.
                            */
                            ns.penalty += (ns.uri ? ns.uri.length : 0) - (e.name.length - 1)
                            
                            
                            
                            ns.left.length = 0;
                        }
                        
                        // Route debugging
                        // console.log(sprintf('[Routing] %-25s: %s', ns.path.join("/"), ns.penalty));
                        
                        return ns;
                    });
                    
                    return states;
                },
                /* A goal state is reached when we have no more urlparts to go
                 * and the given state has a resource bound with our given verb 
                 */
                goal: function (s) {
                    return !s.left.length && (!verb || s.data.resources[verb]);
                }
            });


        },
        /* Gets the route node given by our url and verb
         * url: url to match against our routes
         * verb: verb used to request the url */
        getRoute: function(url, verb) {
            var search = this.searchRoutes(url, verb);
            
            // Get the first match and if present the resource
            var node = search.next();
            if(node) {
                var resource = node.data.resources[verb];
                // if(node.data.isWildcard) {
                //     resource = resource.slice(0, resource.indexOf('*')) + node.uri;
                // }

                return { 
                    path: node.path, 
                    params: node.params, 
                    resource: resource,
                    uri: node.uri
                };
            }

            return false;
        },
        // List all routes in the routing table
        list: function() {
            var o = {};

            function rec(n, str) {
                var k;
                for(k in n.resources)
                    o["[" + k + "]" + str] = n.resources[k];

                for(k in n.routes)
                    rec(n.routes[k], str + "/" + k);

            }

            rec(this, "");

            var str = "";
            for(var k in o) {
                str += sprintf('%-25s: %s \n', k, o[k]);
            }

            return str;
        },
        // Clear the routing table
        clear: function() {
            delete this.routes
            this.routes = {};
        }
    });


    return { RouteMap: RouteMap };
})($o)