[![Build Status](https://travis-ci.org/blackshadev/Roadie.svg)](https://travis-ci.org/blackshadev/Roadie)
## TL;DR
Serve content with simple webservices. See working example bellow.

# Roadie
Roadie is a webserver which serves content via custom created webservices.
What set Roadie appart is that not only all contect goes via these webservices but also these webservices are also created and extended via an Object Oriented manner.


## Features
 - No breaking changes are made from 0.2.0 fowards, only new features and tweaks are introduced.
 - Creation of webservices with nodeJS with an Object Oriented pattern
 - Controllable via its own config shell (`node examples/configShell.js`)
   - Including dynamicly reloading webservices and automaticly recovering from crashes.
 - RESTfull routing, accepting wildcards and parameters
  - Wildcard routes are translated to regular expressions, this means it is possible to serve files based upon prefix or postfix and extension, see example/routing.json. 
  - note: Currently it accepts only one wildcard and only at the end of the route
 - HTTPS integration
 - Possible to include websocket services like [ws](https://github.com/websockets/ws).

### Change log
 - 1.0.0  Fixed core lib such that it does not use arguments.caller.callee anymore, this change will ensure compatibility with strict mode and increase performance. (This does mean that all webservices can no longer use `this.inherited()`.)
 - 0.4.0  Fixed the length calculation where it counts the number of bytes instead of the number of characters.

### Routing
Routing is done with a greedy search algoritm, it "searches" the correct route for you via a route
 table. A good thing to note is that the route is split up in segements, 
 currently these segments are seperated in the url with a "/". This means
 that you cannot have a parameter surrounded by "/"s and not a wildcard at the 
 end of an url. This will increase the routing with large route tables. Moreover it is easy to add routing features upon. See [Routing.js](Routing.js) and [Search.js](Search.js) for the implementation.


## ToDo
 - Add more default webservices such as the staticService
 - More routing options with wildcards

## Lets do this
See Wiki more details

start.js
```javascript
"use strict";
var $r = require("roadie");

// Routes in routing.js and add a inline route.
var routes = ["routing.json", { "[GET,POST]/statics/*" : "static.js" }]

// HTTP server with (optional) config server
var server = new $r.Server({port: 8080, webserviceDir: "webservices/", root: __dirname  });
var config = new $r.ConfigServer(server, { port: 4242 });

// Add the routes to the server
server.addRoutes(routes);

console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");

server.start();
config.start();
```
routing.json
```json
{
    "[GET]/test/{id}/" : "test.js:gId",
    "[GET]/test/hallo/": "test.js:hallo",
}
```
webservices/test.js
```javascript
"use strict";
var $r = require("roadie");

module.exports = $r.WebService.extend({
    // Simple webservice returning "HAAY!"
    hallo: function() { 
        this.ctx.response.data("HAAY!");
        this.ctx.response.send();
    },
    // Webservice which will return the parameter it got within the URL.
    gId: function() {
        var id = this.ctx.request.parameters.id;
        this.ctx.response.data("got: " + id);
        this.ctx.response.send();
    }
});
```