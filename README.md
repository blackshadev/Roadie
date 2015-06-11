Roadie is a webserver which serves content via custom created webservices.
What set Roadie appart is that not only all contect goes via these webservices but also these webservices are also created and extended via an Object Oriented manner.

TL;DR
Serve content with simple webservices. See working example bellow.

## Features
 - No breaking changes are made from 0.2.0 fowards, only new features and tweaks are introduced.
 - Creation of webservices with nodeJs in an Object Oriented pattern
 - Controllable via its own config shell (`node examples/configShell.js`)
 - RESTfull routing, accepting wildcards and parameters
  - Wildcard routes are translated to regular expressions, this means it is possible to serve files based upon prefix or postfix and extension, see example/routing.json. 
  - note: Currently it accepts only one wildcard and only at the end of the route
 - HTTPS integration

### Change log
 - Fixed the length calculation where it counts the number of bytes instead of the number of characters.

### Routing
Routing is done with a greedy search algoritm, it "searches" the correct route for you via a route
 table. A good thing to note is that the route is split up in segements, 
 currently these segments are seperated in the url with a "/". This means
 that you cannot have a parameter surrounded by "/"s and not a wildcard at the 
 end of an url.  


## ToDo
 - Add more default webservices such as the staticService
 - More routing options with wildcards

## Lets do this
See Wiki more details

start.js
```javascript
var $r = require("roadie");

var routes = ["routing.json", { "[GET,POST]/statics/*" : "static.js" }]

// HTTP server
var server = new $r.Server({port: 8080, webserviceDir: "webservices/", root: __dirname  });
var config = new $r.ConfigServer(server, { port: 4242 });

// Add the routes
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
var $r = require("roadie");

module.exports = $r.WebService.extend({
    hallo: function() { 
        this.ctx.response.data("HAAY!");
        this.ctx.response.send();
    },
    gId: function() {
        var id = this.ctx.request.parameters.id;
        this.ctx.response.data("got: " + id);
        this.ctx.response.send();
    }
});
```