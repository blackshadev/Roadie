/** Junction core elements
* @namespace $jn
*/
$jn = {};
$jn = ( function($jn) {

	/** Main empty object, jst like the java Object class
	* @constructor TObject
	* @memberof $jn */
	$jn.TObject = function() {};
	$jn.TObject.prototype.create = function() {};
	$jn.TObject.prototype.destroy = function() {
		return null;
	};
	$jn.TObject.prototype.className = "TObject";
	$jn.TObject.prototype.superClass = null;
	$jn.TObject.prototype.toString = function() {
		return "[Object " + this.className + "]";
	};
	/** Gets the inherited functions of the parent */
	$jn.TObject.prototype.inherited = function() {
		var o = arguments.callee.caller.$inherited;
		if (!o) {
			errmsg("inherited function does not exist class:" + this.className);
		}
		return o;
	};

	$jn.TObject.override = function(meth, fn) {
		this.prototype[meth] = fn;
		fn.$inherited = this.prototype.superClass;
	};
	/** Extends the class
	* @param {string} className Name of the class
	* @param {object} objDef defenition of class. Functions and properties. */
	$jn.TObject.extends = function(className, objDef) {
		var classDef = function() {
			if (arguments[0] !== $jn.TObject) {
				this.create.apply(this, arguments);
			}
		};
		var proto = new this($jn.TObject);

		proto.className = className;
		proto.superClass = this.prototype;
		// iterate trough the objDef and adds them to the new prototype
		for (var iX in objDef) {
			var item = objDef[iX];
			if (item instanceof Function && this.prototype[iX]) item.$inherited = this.prototype;
			proto[iX] = item;
		}

		classDef.prototype = proto;

		//override static functions
		classDef.extends = this.extends;
		classDef.override = this.override;
		return classDef;
	};

	var errmsg = function(msg) {
		console.error(msg);
	};

	$jn.TList = $jn.TObject.extends("TList", {
		idxPrefix: null,
		idxCounter: 0,
		idxFld: null,
		elType: null,
		items: null,
		itemsArray: null,
		/** Generic list 
		 * @constructor TList
		 * @extends $jn.TObject
		 * @memberof $jn
		 * @param {object} oPar Parameters, not yet used
		 * @prop {object} items The list as oject, with keys given by the object's idxFld. If idxFld is null, the key will be generated with idxPrefix and idxCounter 
		 * @prop {array} itemsArray The list as array */
		create: function(oPar) {
			this.items = {};
			this.itemsArray = [];
		},
		/** Adds an element to TList
		 * @memberof $jn.TList
		 * @instance
		 * @param {object} el element to add to the list*/
		add: function(el) {
			var idx;
			if (this.idxFld) {
				idx = el[this.idxFld];
			} else {
				idx = this.idxPrefix + this.idxCounter++;
			}
			if (this.items[el[this.idxFld]]) {
				throw new Error(this.idxFld + " is not an unique field.");
			}
			this.items[idx] = el;
			this.itemsArray.push(el);
			return el;
		},
		/** @memberof $jn.TList
		 * @instance  */
		toString: function() {
			return this.itemsArray.toString();
		}
	});

	/** List of all items, with as items {@link $jn.TCacheEntry|TCacheEntry}
	 * @memberof $jn
	 * @constructor TServerCache
	 * @extends $jn.TList */
	$jn.TServerCache = $jn.TList.extends("TServerCache", {
		elType: $jn.TCacheEntry,
		idxFld: "fullName",
		/** Adds an entry to the cache by creating an {@link $jn.TCacheEntry|TCacheEntry} with the given parameters
		 * @memberof $jn.TServerCache
		 * @instance
		 * @param {object} el parameters for the {@link $jn.TCacheEntry|TCacheEntry} object */
		add: function(oPar) {
			return this.inherited().add.call(this, new $jn.TCacheEntry(oPar));
		}
	});

	$jn.TCacheEntry = $jn.TObject.extends("TCacheEntry", {
		fullName: "",
		filePath: "",
		fileName: "",
		reroute: "",
		mimeType: "",
		encodeMimeType: "",
		encodeType: "",
		ext: "",
		lastModified: null,
		compressedFiles: null,
		length: null,
		/** An entry of the {@link $jn.TServerCache|TServerCache}
		 * @constructor TCacheEntry
		 * @memberof $jn
		 * @extends $jn.TObject
		 * @prop {string} fullName			The full file name (with path)
		 * @prop {string} filePath			The path to the file
		 * @prop {string} ext				The extention of the file
		 * @prop {string} reroute			The fullName (index) of the Cache entry this file is rerouted to (./ to ./index.htm)
		 * @prop {string} mimeType			The mimeType of the file, determined by matching the file extention to a predefined list. Used in the header of the HTTP response. 
		 * @prop {string} encodeMimeType	The file encoding type (charsets, binary, ect.). Used in tje HTTP response
		 * @prop {string} encodeType		The encodeType / compression type. (eg. gzip, deflate)
		 * @prop {Date} lastModified		The lastModified date given by the file stats. 
		 * @prop {object} compressedFiles	The cache entry keys of the compressed files. The kind of compression as object key (gzip, deflate)
		 * @prop {integer} length			The file size
		 */
		create: function(oPar) {
			this.fullName = oPar.fullName;
			this.filePath = oPar.filePath;
			this.fileName = oPar.fileName;
			this.ext = oPar.ext;
			this.mimeType = oPar.mimeType;
			this.encodeMimeType = oPar.encodeMimeType;
			this.encodeType = oPar.encodeType;
			this.length = oPar.length;
			this.reroute = oPar.reroute;
			this.compressedFiles = null;
		},
		toString: function() {
			return "TCacheEntry: ["+this.fullName+"]: reroute{"+this.reroute+"}";
		}
	});

	$jn.TServer = $jn.TObject.extends("TServer", {
		cluster: null,
		configFile: "config.json",
		listeners: 0,
		port: 80,
		location: undefined,
		staticBaseDir: 'public',
		dynamicBaseDir: 'cgi-bin',
		dynamicUrlHook: 'cgi-bin',
		cache: null,
		/** The main server Object. Which will start the server with the given configs
		 * @constructor TServer
		 * @memberof $jn
		 * @extends $jn.TObject
		 * @param {object} oPar
		 * @param {integer} [oPar.port=80]				The port on which the server will run
		 * @param {string} [oPar.location='127.0.0.1']	The location the server wll listen to
		 * @param {string} [oPar.staticBaseDir='public']		The base directory for the webfiles
		 * @param {integer} [oPar.listeners=numCpus]	The number of listerners deployed
		 */
		create: function(oPar) {
			for(var key in oPar)
				this[key] = oPar[key];
			this.cache = new $jn.TServerCache();

			this.cluster = require("cluster");
			this.listeners = oPar.listeners || require("os").cpus().length;
		},
		/** Starts the webserver; forks all the workers given by the value of Listener and starts all their listeners. <br />On a request it will trigger the function {@link $jn.TServer.handleRequest}
		 * @memberof $jn.TServer
		 * @instance
		 */
		start: function() {
			var self = this;
			if(this.cluster.isMaster) { // lets create some child processes
				console.log(this.listeners);
				for(var i = 0; i < this.listeners; i++)
					this.cluster.fork();

				this.cluster.on("fork", function(worker) {
					console.log("Worker forked (nasty) with pid " + worker.process.pid);
				});
				this.cluster.on("exit", function(worker) {
					console.log("Worker died (tip) with pid " + worker.process.pid);
				});
			} else {
				this.cluster.worker.process.title = "Junction WebHandler";
				require('http').createServer(function(req, resp) {
					self.handleRequest(req, resp);
				}).listen(this.port);
				console.log('Server running at pid:' + this.cluster.worker.process.pid + ' http://'+this.location+':'+this.port+'/');
			}
		},
		/** Handles a request. Triggered by the listerners. <br />Creates a new {@link $jn.TServerRequest|TServerRequest}
		 * @memberof $jn.TServer
		 * @instance
		 * @param {nodejs.HTTPRequest} request The request object from nodeJs HTTPRequest
		 * @param {nodejs.HTTPResponse} response The response object from nodeJs HTTPResponse
		 */
		handleRequest: function(req, resp) {
			console.log("process handled by " + this.cluster.worker.process.pid);
			new $jn.TServerRequest(this, req, resp).start();
		}
	});

	$jn.TServerRequest = $jn.TObject.extends("TServerRequest", {
		req: null,
		oUrl: null,
		server: null,
		method: null,
		file: null,
		header: null,
		body: null,
		length: 0,
		type: "static",
		/** The Objects which handles a HTTP Request
		 * @constructor TServerRequest
		 * @memberof $jn
		 * @extends $jn.TObject
		 * @param {$jn.TServer} server				The server object, mainly for cache access
		 * @param {nodejs.HTTPRequest} request		The HTTPRequest given by {@link $jn.TServer#handleRequest|handleRequest()}
		 * @param {nodejs.HTTPResponse} response	The HTTPResponse given by {@link $jn.TServer#handleRequest|handleRequest()}
		 */
		create: function(server, req, resp) {
			this.inherited().create.call(this, req);
			this.req = req;
			this.resp = resp;
			this.oUrl = require('url').parse(this.req.url, true);
			this.server = server;
			this.header = {
				code: 500, // default file error 
				headers: {'Content-Type': 'text/plain'}
			};
		},
		/** Parses the request URL and creates a {@link $jn.TServerFile|TServerFile} with that parsed URL
		 * @memberof $jn.TServerRequest
		 * @instance */
		parseRequestUrl: function() {
			var self = this;
			var file;
			if(this.oUrl.pathname.indexOf(this.server.dynamicUrlHook) === 0) {
				file = "./" + this.server.dynamicBaseDir + thos.oUrl.pathname;
				this.file = new $jn.TDynamicFile(this, file);
				return;
			}
			file = "./" + this.server.staticBaseDir + this.oUrl.pathname;
			this.file = new $jn.TServerFile(this, file);
		},
		/** What the server does when encountering an file error. <br /> Changes the header response code, reroutes to an other file. When the headerCode is changed, {@link $jn.TServerRequest#errorPage|errorPage} is called.
		 * @memberof $jn.TServerRequest
		 * @instance*/
		fileError: function(err) {
			switch (err.errno) {
				case 28:
					this.oUrl.pathname += "index.htm";
					this.file.reroute = "./" + this.server.staticBaseDir + this.oUrl.pathname;
					this.start();
					return false;
				case 34:
					this.header.code = 404;
					break;
				default:
					this.header.code = 500;
					break;
			}
			this.file.mimeType = "text/html";
			this.body = $jn.TServerRequest.errorPage(this.header.code);
		},
		/** Starts the file request by parsing the request URL and calling {@link $jn.TServerFile#pipe|TServerFile.pipe()}
		 * @memberof $jn.TServerRequest 
		 * @instance */
		start: function() {
			var self = this;
			this.parseRequestUrl();
			this.file.pipe(this.resp, {
				start: function(stat) {
					self.header.headers["Content-Type"] = self.file.mimeType;
					self.header.headers["Content-Length"] = self.file.length;
					self.header.code = 200;
					if(self.file.encodeType)
						self.header.headers["content-encoding"] = self.file.encodeType;
					self.resp.writeHead(self.header.code, self.header.headers);
				},
				data: function(data) { self.file.length+=data.length; self.resp.write(data); },
				end: function() { self.resp.end(); self.file.cacheCheck(); },
				error: function(err) { self.fileError(err); }
			});
		}
	});
	/** Handles errorPages ike file not found
	 * @memberof $jn.TServerRequest 
	 * @static */
	$jn.TServerRequest.errorPage = function(code) {
		switch (code) {
			case 404:  return "<h1>Not Found</h1><p>The page you requested could not be found</p>";
			default: return "<h1>Internal Server Error</h1><p>Our server encountered an internal error.</p>";
		}
	};

	$jn.TServerFile = $jn.TObject.extends("TServerFile", {
		serverRequest: null,
		server: null,
		fullName: "",
		filePath: "",
		fileName: "",
		ext: "",
		mimeType: "",
		encodeMimeType: null,
		encodeType: null, //
		length: 0,
		lastModified: null,
		isCached: false,
		compressedFile: null, // contains gZip and deflate file names
		reroute: "", // only used if a file (directory) gets rerouted to another file 
		fs: require("fs"),
		/** The object which handle static file interaction
		 * @constructor TServerFile
		 * @memberof $jn
		 * @extends $jn.TObject
		 * @prop {string} fullName			The full file name (with path)
		 * @prop {string} filePath			The path to the file
		 * @prop {string} ext				The extention of the file
		 * @prop {string} reroute			The fullName (index) of the Cache entry this file is rerouted to (./ to ./index.htm)
		 * @prop {string} mimeType			The mimeType of the file, determined by matching the file extention to a predefined list. Used in the header of the HTTP response. 
		 * @prop {string} encodeMimeType	The file encoding type (charsets, binary, ect.). Used in tje HTTP response
		 * @prop {string} encodeType		The encodeType / compression type. (eg. gzip, deflate)
		 * @prop {Date} lastModified		The lastModified date given by the file stats. 
		 * @prop {object} compressedFiles	The cache entry keys of the compressed files. The kind of compression as object key (gzip, deflate)
		 * @prop {integer} length			The file size
		 * @prop {boolean} [isCache=false]		If file was found as chache entry
		 * @prop {TServerRequest} serverRequest Reference to the {@link $jn.TServerRequest|TServereRequest} instance
		 * @prop {TServer} server				Reference to the {@link $jn.TServer|TServere} instance
		 */
		create: function(serverRequest, fullName) {
			this.fullName = fullName;
			this.serverRequest = serverRequest;
			this.server = serverRequest.server;
			var cache = this.followRoute();
			this.parseFileCache(cache); // fill result in a parseFile cal if cache is empty

		},
		/** parses an ile by the given entry. If entry is undefined {@link $jn.TServerFile#parseFile|parseFile} is called.
		* @memberof $jn.TServerFile
		* @instance */
		parseFileCache: function(entry) {
			if(!entry) { this.parseFile(); return; }
			this.isCache = true;
			for(var iX in entry) {
				this[iX] = entry[iX];
			}
		},
		/** Parses a file by the given {@link $jn.TServerFile#fullName|fullName} property
		 * @memberof $jn.TServerFile
		 * @instance */
		parseFile: function() {
			var lastDirSep = this.fullName.lastIndexOf("/");
			if(lastDirSep < 0)
				return this.error(34);

			this.filePath = this.fullName.substr(0, lastDirSep);
			if(!this.filePath)
				this.filePath = "/";
			this.fileName = this.fullName.substr(lastDirSep+1, this.fullName.length);
			this.ext = this.fileName.substr(this.fileName.lastIndexOf(".")+1, this.fileName.length);

			var mime = $jn.TServerFile.mime(this.ext);
			this.mimeType = mime[0];
			this.encodeMimeType = mime[1];
			this.isCache = false;
		},
		/** @memberOf $jn.TServerFile
		 * @instance */
		toString: function() {
			return "File: " + this.fileName + "\r\n" + "Path: " + this.filePath +
				"\r\n" + "ext: " + this.ext +
				"\r\n" + "MimeType: " + this.mimeType +
				"\r\n" + "encodeMimeType: " + this.encodeMimeType +
				"\r\n";
		},
		/** Implements the stream functioniality
		 * @memberof $jn.TServerFile
		 * @instance
		 * @param {object} destination		The destination to which the data is send
		 * @param {object} oPar				Parameters with event handlers (eg. data, end, start)  */
		pipe: function(dest, oPars) {
			if(this.isCache)
				this.cacheHit(dest, oPars);
			else
				this.cacheMiss(dest, oPars);
		},
		/** creates a {@link nodejs.ReadableStream|ReadableStream} of the file. With events given in oPar
		 * @memberof $jn.TServerFile
		 * @instance
		 * @param {object} oPar		The events on which the stream should listen
		 */
		createStream: function(oPars) {
			var fstream = this.fs.createReadStream(this.fullName);
			for(var type in oPars) {
				fstream.on(type, oPars[type]);
			}
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		cacheHit: function(dest, oPars) {
			//this.followRoute();
			//if(!this.isCache) { this.cacheMiss(dest, oPars); return; }
			oPars.start();
			delete oPars.start;

			this.createStream(oPars);
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		followRoute: function() {
			var cache = this.server.cache.items[this.fullName];
			if(!cache) return cache;
			while(cache.reroute) {
				cache = this.server.cache.items[cache.reroute];
			}
			var compressedFile;
			
			if(cache.compressedFiles) {
				var acceptEncoding = this.serverRequest.req.headers["accept-encoding"];
				if(acceptEncoding.match(/\bdeflate\b/)) {
					this.encodeType = "deflate";
					compressedFile = cache.compressedFiles.deflate;
				} else if(acceptEncoding.match(/\bgzip\b/)) {
					this.encodeType = "gzip";
					compressedFile = cahche.compressedFiles.gzip;
				}
				if(compressedFile) {
					this.fullName = compressedFile;
					cache = this.server.cache.items[compressedFile];
				}
			}
			return cache;
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		cacheMiss: function(dest, oPars) {
			console.log("Cachemiss for " + this.fullName );
			var self = this;
			var statFn = oPars.start;
			var statErr = oPars.error;
			delete oPars.start;
			delete oPars.error;
			var hasErr = false;

			this.fs.stat(this.fullName, function(err,stat) {
				if(err)
					statErr(err);
				else {
					if(stat.isDirectory()) {
						statErr({errno: 28});
					} else {
						self.lastModified = stat.mtime;
						self.length = stat.size;
						statFn(stat);
						self.createStream(oPars);
					}
					// add to cache
					self.refreshCache(null, stat);
				}
			});
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		cacheCheck: function() {
			var cacheEntry = this.server.cache.items[this.fullName];
			var self = this;
			this.fs.stat(this.fullName, function(err,stat) {
				if(!cacheEntry || stat.mtime.getTime() > cacheEntry.lastModified) {
					self.refreshCache(cacheEntry, stat);
				}
			});
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		refreshCache: function(entry, stat) {
			this.length = stat.size; // if the request was handled by cache, no size was given
			if(!entry)
				entry = this.server.cache.add(this);
			entry.lastModified = this.lastModified = stat.mtime;

			if(!entry.reroute) {
				entry.compressedFiles = {};
				this.compress(entry.compressedFiles);
			}
		},
		/**
		 * @memberof $jn.TServerFile
		 * @instance
		 */
		compress: function(obj) {
			var self = this;
			var zlib = require("zlib");
			var deflateStrm = this.fs.createWriteStream(this.filePath + '/' + this.fileName + ".defl" + "." + this.ext);
			var gzipStrm = this.fs.createWriteStream(this.filePath + '/' + this.fileName + ".gzip" + "." + this.ext);

			var fstrm = this.fs.createReadStream(this.fullName);
			fstrm.on("open", function() {
				fstrm.pipe(zlib.createGzip()).pipe(gzipStrm);
				fstrm.pipe(zlib.createDeflate()).pipe(deflateStrm);
			});

			fstrm.on("end", function() {
				obj["deflate"] = self.filePath + '/' + self.fileName + ".defl" + "." + self.ext;
				obj["gzip"] = self.filePath + '/' + self.fileName + ".gzip" + "." + self.ext;
			});
		}
	});

	$jn.TDynamicFile = $jn.TObject.extends("TDynamicFile", {
		filePath: "",
		create: function(filePath) {
			thisfilePath = filePath;
		},
		/**
		oPar contains a start function which writes the headers,
		an data path which passes the data to the connection
		end to close the connection and error for file errors
		*/
		pipe: function(oPar) {

		}
	});
	/**
	 * @memberof $jn.TServerFile
	 * @static
	 */
	$jn.TServerFile.mime = function(ext){
		switch(ext.toLowerCase()) {
			case "htm": case "html": return ["text/html", "utf-8"];
			case "json": return ["application/json", "utf-8"];
			case "js": return ["application/javascript", "utf-8"];
			case "pdf": return ["application/pdf", "binary"];
			case "css": return ["text/css", "utf-8"];
			case "gif": return ["image/gif", "binary"];
			case "jpg": case "jpeg": return ["image/jpeg", "binary"];
			case "png": return ["image/png", "binary"];
			case "csv": return ["text/csv", "utf-8"];
			default: return ["text/plain", "utf-8"];
		}
	};

	return $jn;
})($jn);
exports.$jn = $jn;