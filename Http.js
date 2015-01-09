/** Http.js
 *  Author: Vincent Hagen
 *
 *  Wrappers for nodeJs Http objects
 */

module.exports = (function() {
	var $o = require("./core.js");
	var EventEmitter = require("events").EventEmitter;
	var errno = require("./ErrNo.js").errno


	/* An http Error can be constructed with a nodeJs Error object as the first argument
	 	or an other HttpError as argument
	 	or an string as text 
	 	or an httpstatus code , (opt) text and (opt) extra text */
	var HttpError = $o.Object.extend({
		extra: "",
		code: 500, // http status code
		text: null,
		create: function(err, errtxt, extra) {
			if(err instanceof HttpError) {
				this.extra = err.extra;
				this.text = err.text;
				this.code = err.code;
            } else if(err instanceof Error) {
				var errDescr = HttpError.translateErrNo(err.errno);

				this.code = errDescr.http || 500;
				
				this.extra = errDescr ? errDescr.description : err.toString();
			} else if(arguments.length === 2 && typeof(errtxt) === "string") {
				this.code = err;
				this.extra = errtxt;
			} else if(arguments.length === 3) {
				this.code = err;
				this.errtxt = errtxt;
				this.extra = extra;
			} else if(typeof(err) === "string") {
				this.extra = err;
			} else if(arguments.length === 1 && typeof(err) === "number") {
                this.code = err;
            }

			if(!this.text) this.text = HttpError.httpStatusText(this.code);
		},
        // Returns the Http status code, text and extra 
		httpStatus: function() {
			return { 
				code: this.code, 
				text: this.text,
				extra: this.extra
			};
		},
        // Sends the Error the the client bound by the given HttpContext
		send: function(ctx) {
			console.log("[Error:" + this.code + "]: " + this.extra);

			var st = this.httpStatus();
			ctx.response.status(st.code);

			ctx.response.data("<h1>" + st.code + " " + st.text + "</h1>");
			if(st.extra) ctx.response.append(st.extra);

			ctx.response.send();
		}
	});
	HttpError.translateErrNo = function(no) { return errno[no]; };
	HttpError.httpStatusText = function(no) {
        // Incomplete, should have more of these
		switch(no) {
			case 200: return "OK";
			case 404: return "Not found";
			case 403: return "Forbidden";
			default:  return "Internal Server error";
		}
	};

    // Wrapper class for the HTTP response
    var HttpResponse = $o.Object.extend({
        headers: null,
        statusCode: 200,
        eos: false, // stream has ended
        _res: null,
        _data: null,
        create: function(res) {
            this._res = res;
            this.headers = { 'Content-Type': "text/html" };
        },
        /* Set the statuscode of the response
         * code: the HTTP status code */
        status: function(code) {
            this.statusCode = code;
        },
        /* Set a header of the response
         * t: the name of the HTTP header
         * c: the content of the HTTP header */
        header: function(t, c) {
            this.headers[t] = c;
        },
        /* Set the data of the response
         * dat: Data to set, can be a json object which is stringified
         * bin: if set to true no conversions performed in dat */
        data: function(dat, bin) {
            if(!bin && typeof(dat) === "object") {
                dat = JSON.stringify(dat);
                this.header("Content-Type", "application/json");
            }

            this._data = dat;
        },
        /* Appends data */
        append: function(dat) {
            if(typeof(dat) === "object")
                dat = JSON.stringify(dat);
            this._data += dat;
        },
        /* Sends the headers and content of the response */
        send: function() {
            if(this.eos) return console.log("Request already send");

            this._res.writeHead(this.statusCode, this.headers);
            console.log("[server] sending: " + typeof(this._data) + " of length " + this._data.length);
            this._res.write(this._data);
            this._res.end();
            this.eos = true;
        }
    });

    // Wrapper for a http request
    var HttpRequest = $o.Object.extend({
        headers: null, // Http headers
        parameters: null, // Parameters set within the routing
        uri: "", // Left over URI, only set when the route endnode is a wildcard
        routePath: "", // Route taken with request url
        // private
        isLoaded: false,  // Boolean to check whenever the body is loaded
        events: null, // EventEmitter for the loadend event 
        _req: null, // NodeJs request object
        _data: null, // _data contained in the body of the HTTP request
        create: function(req) {
            this._req = req;
            this.headers = req.headers;
            this.events = new EventEmitter();

            var self = this;
            this._data = new Buffer(0);

            req.on("data", function(dat) {
                self._data = Buffer.concat([self._data, dat]);
            });
            req.on("end", function() {
                self.isLoaded = true;
                self.events.emit("loadend", self._data);
            });
        },
        /* Gets the body of the request.
           cb: function which is called after getting the body as first argument
           bin: When set to true the body isn't casted to a string */
        body: function(cb, bin) {
            if(this.isLoaded)
                cb(bin ? this._data : this._data.toString());
            else
                this.events.once("loadend", this.body.bind(this, cb, bin));
        },
        /* Returns one of the header contents
            k: The header type to return */
        header: function(k) {
            return this.headers[k];
        },
        /* Returns a parameter given in the url routing
            k: key/name of the parameter */
        parameter: function(k) {
            return this.parameters[k];
        }
    });

    // Context wrapping a http request
    var HttpContext = $o.Object.extend({
        method: 'GET',
        url: '/',
        // Privates
        foundResource: null, // reference to the resource whch is bound to the given url
        uri: null,
        response: null, // store for all data to send
        parameters: null,  
        uri: null, // Stores the rest of the URI
        _req: null,
        _res: null,
        _server: null, 
        create: function(server, req, res) {
            this._req = req;
            this._res = res;
            this._server = server;
            this.response = new HttpResponse(res);
            this.request = new HttpRequest(req);

            this.method = req.method;
            this.url = req.url;

        },
        /* Resolves the request URL in the routing map and fills the 
            HttpRequest object. Returns true if a resource was found.  */
        resolveUrl: function() {
            var rm = this._server.routemap;
            var tmp = rm.getRoute(this.url, this.method);

            if(!tmp) return false;
            
            this.request.parameters = tmp.params;
            this.request.uri = tmp.uri;
            this.request.routePath = tmp.path.join("/");
            
            this.foundResource = tmp.resource;

            return !!this.foundResource;
        },
        error: function(err) {
        	if(!( err instanceof HttpError))
        		err = new HttpError(err);

        	err.send(this);

        	return false;
        },
        // Returns the root of the server
        cwd: function() { return this._server.root; }
    });

    return { HttpContext: HttpContext, HttpRequest: HttpRequest, HttpResponse: HttpResponse, HttpError: HttpError };
})();