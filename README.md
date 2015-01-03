Junction is a webserver which serves content via custom created webservices.
What set Junction appart is that not only all contect goes via these webservices but also these webservices are also created and extended via an Object Oriented manner.

## Features
 - Creation of webservices with nodeJs in an Object Oriented pattern
 - Controllable via its own config shell (examples/startConfigShell.js)
 - RESTfull routing, accepting wildcards and parameters
  - note: Currently it accepts only one wildcard and only at the end of the route

### Routing
Routing is done with Astar, it "searches" the correct route for you via a route
 table. A good thing to note is that the route is split up in segements, 
 currently these segments are seperated in the url with a "/". This means
 that you cannot have a parameter surrounded by "/"s and not a wildcard at the 
 end of an url.  


## ToDo
 - HTTPS intergration
 - Add more default webservices such as the staticService
 - More routing options with wildcards