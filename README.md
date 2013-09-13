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
  - core.js:TServerRequest::fileError
  	Use the predefined base files and cache to find an landingspage instead of hardcoded index.htm
  -	core.js:TServerRequest::create
  	Make a specific parseUrl function which gives the request URI, and headers.