-- Note --
This is an old, none functional version of junction. Look at the master branch
for the current upto date version of junction

*****

Imagine you could make a serverside backend for your website written in JS. No clucky PHP, Python or Ruby, no Microsoft logic and languages. Just JS with the extension of nodeJS.
This project is there to make that happen

Junction is a simple webserver written in nodeJs.
At its current state Junction will only send default HTML pages with the addition of CSS, JS and common images and data types.

Our philosophy is keep it simple and clean, so don't expect any fancy functions.

Future features:
 - JSON Config file
 - MSSql implementation

Features:
 - Really standard webservice based upon javascript and nodeJS
 - Request handling by multiple processes (nodeJS Cluster)
 - Auto compression (Gzip and deflate)
 - Cache currently only caches the stats, this saves 1 file access but the file that is sent is still up to date, and saves allot of memory
 - Dynamic content given by serverside javaScript, inline and webservice based

 TODO:
  -	junction.js:TServerRequest::create
  	Make a specific parseUrl function which gives the request URI, and headers.
  - jnServerFile.js: Cleanup and rename some stuff
  - jnFunctions.js: group functions together to get a better structure
  - Inline javascript code must implement the same functions as webservices file's, with a few exceptions
  - jnServerFile.ks&junction.js: dynamic file content compression
  - saving the resulted .vm file from dynamic files, add them to the route, actually use that route and execute that file instead.
  - Trowing away old junk code
