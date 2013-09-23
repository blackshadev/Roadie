Imagine you could make a serverside backend for your website written in JS. No clucky PHP, Python or Ruby, no Microsoft logic and languages. Just JS with the extension of nodeJS.
This project is there to make that happen

Junction is a simple webserver written in nodeJs.
At its current state Junction will only send default HTML pages with the addition of CSS, JS and common images and data types.

Our philosophy is keep it simple and clean, so don't expect any fancy functions.

Future features:
 - JSON Config file
 - Serverside JS functionality: RESTfull style.
 - MSSql implementation

Features:
 - Really standard webservice based upon javascript and nodeJS
 - Request handling by multiple processes (nodeJS Cluster)
 - Auto compression (Gzip and deflate)
 - Cache currently only caches the stats, this saves 1 file access but the file that is sent is still up to date, and saves allot of memory

 TODO:
  -	core.js:TServerRequest::create
  	Make a specific parseUrl function which gives the request URI, and headers.
  - jnServerFile.js: output is now determined by return value, This is really stupid. The nature of nodeJs is async and you simply can't get async content in the return value without dump thread sleeping. Solution: event functions in jnServerFunction class in which you can append content and emit an event to send the data to the client. Take a look at this for event emmiters http://venodesigns.net/2011/04/16/emitting-custom-events-in-node-js/