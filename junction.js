var $jn = require("./core.js");
require("./jnServerFile.js");

(function($jn) {
	// Used regexes
	var re = { deflate: /\bdeflate\b/, gzip: /\bgzip\b/ };

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
		isDir: false,
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
			this.isDir = oPar.isDir;
			this.parentFile = oPar.parentFile;
			this.isCompressed = !!oPar.isCompressed;
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
		defaultPages: ["index.htm"],
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
		resp: null,
		respHeader: null, // headers used in the response
		reqHeaders: null, // headers send with req
		oUrl: null,
		server: null,
		method: null,
		data: null, // data sended by the client
		query: null, // query usd in url
		file: null,
		header: null,
		body: null,
		length: 0,
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
			this.method = req.method;
			this.oUrl = require('url').parse(this.req.url, true);
			
			this.data = {};
			this.query = this.oUrl.query;

			this.server = server;
			this.respHeader = {
				code: 200, // default file error 
				headers: {'Content-Type': 'text/html'}
			};

			this.parseClientHeaders();
		},
		/** Copy the client headers and split the cookie */
		parseClientHeaders: function() {
			this.reqHeaders = $jn.extend({}, this.req.headers);
			var cookies = {};

			if(this.reqHeaders.cookie) {
				var arr = this.reqHeaders.cookie.split(';');
				var cookieArr;
				for(var iX = 0; iX < arr.length; iX++) {
					cookieArr = arr[iX].split('=');
					cookies[cookieArr[0].trim()] = cookieArr[1].trim();
				}
			}
			this.reqHeaders.cookies = cookies;
		},
		readClientData: function(callback) {
			var dataStr = "";
			this.req.on("data", function(data) {
				dataStr += data.toString("utf8");
			});

			// parse the string
			var self = this;
			this.req.on("end", function() {
				self.data = require("querystring").parse(dataStr);
				callback();
			});
		},
		/** Parses the request URL and creates a {@link $jn.TStaticFile|TStaticFile} with that parsed URL
		 * @memberof $jn.TServerRequest
		 * @instance */
		parseRequestUrl: function() {
			var self = this;

			var classFn = this.serverFileClass();
			this.file = new classFn(this, this.oUrl.pathname);
		},
		/** Determins which of the file classes to use for this file
		*/
		serverFileClass: function() {
			var classFn = $jn.TStaticFile;
			var path = this.oUrl.pathname;
			console.log(path);
			if(path.indexOf(this.server.dynamicUrlHook) > 0)
				classFn = $jn.TDynamicFile;
			else if(path.substr(path.lastIndexOf(".")+1, path.length) === "jshtml")
				classFn = $jn.TPreprocessor;
			return classFn;
		},
		/** What the server does when encountering an file error.<br />
		 * Changes the header response code, reroutes to an other file. When the headerCode is changed
		 * {@link $jn.TServerRequest#errorPage|errorPage} is called.
		 * @memberof $jn.TServerRequest
		 * @instance*/
		fileError: function(err) {
			switch (err.errno) {
				case 28:
					/* Upon encountering a folder, search for the defaultPages
					 * and add the first one you find to the cache route. */
					var self = this;
					var fs = require("fs");
					var oldPath = this.server.staticBaseDir + self.oUrl.pathname;
					this.isDir = true;
					for(var i = 0; i < this.server.defaultPages.length; i++) {
						/* This is slower than the async version but wit does the job better */
						var filePath = oldPath + this.server.defaultPages[i];
						var exists = fs.existsSync("./" + filePath);
						if(exists) {
							console.log("Rerouted: " + oldPath + " to " + filePath);
							self.oUrl.pathname += self.server.defaultPages[i];
							self.file.reroute = "./" + filePath;
							self.start();
							break;
						}
					}
					return false;
				case 34:
					this.respHeader.code = 404;
					break;
				default:
					this.respHeader.code = 500;
					break;
			}
			this.file.mimeType = "text/html";
			this.body = $jn.TServerRequest.errorPage(this.respHeader.code);
			this.length = this.body.length;
		},
		/** Starts the file request by parsing the request URL and calling {@link $jn.TStaticFile#pipe|TStaticFile.pipe()}
		 * @memberof $jn.TServerRequest 
		 * @instance */
		start: function() {
			var self = this;
			this.parseRequestUrl();
			this.readClientData(function() {
				var streamPars = {
					start: function() {
						self.respHeader.headers["Content-Type"] =
							self.file.mimeType;
						self.respHeader.headers["Content-Length"] =
							self.length || self.file.length;
						// console.log(self.respHeader.headers);
						// console.log("Written length header " + self.file.length);
						if(self.file.encodeType)
							self.respHeader.headers["content-encoding"] =
								self.file.encodeType;
						self.resp.writeHead(self.respHeader.code,
							self.respHeader.headers);
					},
					data: function(data) {
						// console.log("Got data: " + data);
						self.file.length += data.length;
						self.resp.write(data); },
					end: function(noCache) {
						// console.log("Connection closed");
						self.resp.end();
						if(!noCache) self.file.cacheCheck();
					},
					error: function(err) {
						self.fileError(err);
						streamPars.start();
						streamPars.data(self.body);
						streamPars.end();

					}
				};
				self.file.pipe(self.resp, streamPars);
			});
		},
		getDynamicHeaders: function() {
			return {
				headers: $jn.extend({},this.req.headers),
				query: $jn.extend({}, this.query),
				data: $jn.extend({}, this.data),
				method:  this.method,
				cookies: $jn.extend({}, this.reqHeaders.cookies)
			};
		},
		getSupportedCompressionMethods: function() {
			/* returns the flag first bit deflate, last bit gzip */
			var flag = 0;
			flag |= re.deflate.test(this.req.headers['accept-encoding']) ? 1 : 0;
			flag |= re.gzip.test(this.req.headers['accept-encoding']) ? 2 : 0;

			return flag;
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

	/* Abstract of all files, each file should have these */
	$jn.TServerFile = $jn.TObject.extends("TServerFile", {
		server: null,
		serverRequest: null,
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
		create: function(serverRequest, requestUri){
			this.serverRequest = serverRequest;
			this.server = serverRequest.server;
		},
		/** Implements the stream functioniality
		 * @memberof $jn.TServerFile
		 * @instance
		 * @param {object} destination		The destination to which the data is send
		 * @param {object} oPar				Parameters with event handlers (eg. data, end, start)  */
		pipe: function() {},
		/** Assigns the default fullName property with a given requestUri
		 * @memberof $jn.TServerFile
		 * @instance */
		parseFilePath: function(requestUri) {
			this.fullName = this.server.staticBaseDir +
				this.serverRequest.oUrl.pathname;
		},
		/** Parses a file by the given {@link $jn.TServerFile#fullName|fullName} property
		 * @memberof $jn.TServerFile
		 * @instance */
		parseFile: function() {
			var parsedFile = $jn.TServerFile.parseFile(this.fullName);
			if(parsedFile === false)
				return obj.error(34);
			$jn.extend(this, parsedFile);
		},
		/** @memberOf $jn.TServerFile
		 * @instance */
		toString: function() {
			return "File: " + this.fileName + "\r\n" + "Path: " + this.filePath +
				"\r\n" + "ext: " + this.ext +
				"\r\n" + "MimeType: " + this.mimeType +
				"\r\n" + "encodeMimeType: " + this.encodeMimeType +
				"\r\n";
		}
	});
	$jn.TServerFile.parseFile = function(fullName) {
		var obj = { fullName: fullName };
		var lastDirSep = fullName.lastIndexOf("/");
			if(lastDirSep < 0)
				return {};

			obj.filePath = fullName.substr(0, lastDirSep);
			if(!obj.filePath)
				obj.filePath = "/";
			obj.fileName = fullName.substr(lastDirSep+1, fullName.length);
			obj.ext = obj.fileName.substr(obj.fileName.lastIndexOf(".")+1, obj.fileName.length);
			
			var mime = $jn.TStaticFile.mime(obj.ext);
			obj.mimeType = mime[0];
			obj.encodeMimeType = mime[1];
			obj.isCache = false;
		return obj;
	};

	$jn.TStaticFile = $jn.TServerFile.extends("TStaticFile", {
		cacheEntry: null, // reference to the cacheEntry
		create: function(serverRequest, requestUri) {
			this.inherited().create.apply(this, arguments);

			this.parseFilePath(requestUri);
			var cache = this.followRoute();
			this.parseFileCache(cache); // fill result in a parseFile cal if cache is empty

		},
		/** parses an ile by the given entry. If entry is undefined {@link $jn.TStaticFile#parseFile|parseFile} is called.
		* @memberof $jn.TStaticFile
		* @instance */
		parseFileCache: function(entry) {
			if(!entry) { this.parseFile(); return; }

			$jn.extend(this, entry);
			this.cacheEntry = entry;
			this.isCache = true;
		},
		/** Implements the stream functioniality
		 * @memberof $jn.TStaticFile
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
		 * @memberof $jn.TStaticFile
		 * @instance
		 * @param {object} oPar		The events on which the stream should listen
		 */
		createStream: function(oPars) {
			console.log("Create steam: " + this.fullName);
			var fstream = this.fs.createReadStream(this.fullName);
			for(var type in oPars) {
				fstream.on(type, oPars[type]);
			}
		},
		/**
		 * @memberof $jn.TStaticFile
		 * @instance
		 */
		cacheHit: function(dest, oPars) {
			oPars.start();
			delete oPars.start;

			this.createStream(oPars);
		},
		/**
		 * @memberof $jn.TStaticFile
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
				var supportedEnc = this.serverRequest.getSupportedCompressionMethods();

				if(supportedEnc & 1) {
					this.encodeType = "deflate";
					compressedFile = cache.compressedFiles.deflate;
				} else if(supportedEnc & 2) {
					this.encodeType = "gzip";
					compressedFile = cahche.compressedFiles.gzip;
				}
				if(compressedFile) {
					cache = compressedFile;
				}
			}
			return cache;
		},
		/**
		 * @memberof $jn.TStaticFile
		 * @instance
		 */
		cacheMiss: function(dest, oPars) {
			console.log("Cachemiss for " + this.fullName );
			var self = this;
			var statFn = oPars.start;
			var statErr = oPars.error;
			delete oPars.error;
			var hasErr = false;

			this.fs.stat(this.fullName, function(err,stat) {
				if(err)
					statErr(err);
				else {
					delete oPars.start;
					if(stat.isDirectory()) {
						statErr({errno: 28});
						self.isDir = true;
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
		 * @memberof $jn.TStaticFile
		 * @instance
		 */
		cacheCheck: function() {
			var cacheEntry = this.cacheEntry;
			var fileName = this.fullName;
			if(!cacheEntry) return;
			// jump to parentFile if it has one, this means it was a compressed version
			if(cacheEntry.parentFile) {
				cacheEntry = cacheEntry.parentFile;
				fileName = cacheEntry.fullName;
			}
			var self = this;

			(function(fileName, cacheEntry) {
				self.fs.stat(fileName, function(err, stat) {
					if(!cacheEntry || stat.mtime.getTime() > cacheEntry.lastModified || stat.size !== cacheEntry.length ) {
						self.refreshCache(cacheEntry, stat);
					}
				});
			})(fileName, cacheEntry);
		},
		/**
		 * @memberof $jn.TStaticFile
		 * @instance
		 */
		refreshCache: function(entry, stat) {
			this.length = stat.size; // if the request was handled by cache, no size was given
			if(!entry)
				entry = this.server.cache.add(this);
			entry.lastModified = this.lastModified = stat.mtime;

			if(!entry.reroute && !entry.isDir) {
				var compressedFiles = {};
				this.compress(entry);
				
			}
		},
		addCompressEntry: function(entry, files) {
			for(var key in files) {
				var file = $jn.TServerFile.parseFile(files[key]);
				file.isCompressed = true;
				file.parentFile = entry;
				file.encodeType = key;

				(function(key, file) {
					require('fs').stat(files[key], function(err, stat) {
						if(err) { console.log(err); return; }
						file.length = stat.size;
						file.lastModified = stat.mtime;

						if(!entry.compressedFiles)
							entry.compressedFiles = {};

						entry.compressedFiles[key] = file;
					});
				})(key, file);
			}
		},
		/**
		 * @memberof $jn.TStaticFile
		 * @instance
		 */
		compress: function(entry) {
			var obj = {};
			var self = this;
			var zlib = require("zlib");

			console.log("compressing " + entry.filePath + '/' + entry.fileName);
			var deflateStrm = this.fs.createWriteStream(entry.filePath + '/' + entry.fileName + ".defl" + "." + entry.ext);
			var gzipStrm = this.fs.createWriteStream(entry.filePath + '/' + entry.fileName + ".gzip" + "." + entry.ext);

			var fstrm = this.fs.createReadStream(entry.fullName);
			fstrm.on("open", function() {
				fstrm.pipe(zlib.createGzip()).pipe(gzipStrm);
				fstrm.pipe(zlib.createDeflate()).pipe(deflateStrm);
			});

			fstrm.on("close", function() {
				obj["deflate"] = entry.filePath + '/' + entry.fileName + ".defl" + "." + entry.ext;
				obj["gzip"] = entry.filePath + '/' + entry.fileName + ".gzip" + "." + entry.ext;
				// makes sure the whole stream is writen
				setTimeout(function() { self.addCompressEntry(entry, obj); }, 5);
			});
		}
	});

	$jn.TDynamicFile = $jn.TServerFile.extends("TDynamicFile", {
		fullName: "",
		server: null,
		serverRequest: null,
		fs: require("fs"),
		/* Dynamic files, sets the filepath, 
		 * Executes the dynamic file function with the clientHeaders,
		 * Uses the output as content */
		create: function(serverRequest, filePath) {
			this.inherited().create.apply(this, arguments);

			this.parseFilePath(filePath);
			this.parseFile();
		},
		parseFilePath: function(filePath) {
			var file = filePath.substr(
				filePath.indexOf(this.server.dynamicUrlHook) +
				this.server.dynamicUrlHook.length);
			/* removes the DynamicUrlHook and adds the dynamicFilePath */
			this.fullName = "./" + this.server.dynamicBaseDir +  file;
		},
		/**
		oPar contains a 
		- start function which writes the headers,
		- data function, which passes the data to the connection
		- end function,  to close the connection and error for file errors
		* Get the client headers to pass to the script,
		* change the cwd, and change it back afterwards
		* first execute the file, get the response as json, copy the headers
		* and add everything to data.
		*/
		pipe: function(req, oPar) {
			var dynaFn;

			try {
				/* Default content-type header */
				this.mimeType = "text/html";

				dynaFn = new $jn.jnScript(this, oPar);
				dynaFn.exec();
			} catch(e) {
				console.log(e);
				dynaFn.content = e+"";
				dynaFn.send();
			}
		}
	});
	
	/*
	 * Executes JavaScript snippets in a jshtml file before sending it on the the browser.
	 */
	$jn.TPreprocessor = $jn.TServerFile.extends("TPreprocessor", {
		create: function(serverRequest, filePath) {
			this.inherited().create.apply(this, arguments);

			this.parseFilePath(filePath);
			this.parseFile();
		},
		pipe: function(req, oPar) {
			var self = this;
			var fs = require('fs'), vm = require('vm'),
				browserutils = require('./modules/browserutils');
			fs.readFile(this.fullName, function (err, data) {
				if (err) throw err;
				
				data = data.toString();
				var startIndex, endIndex = -2;

				var html = '';
				var sandbox = {
					require: require,
					console: console,
					utils: {
						transfer: browserutils.transfer,
						transfers: browserutils.transfers
					}
				};

				var varCounter = 0;
				var newVarName = function(prefix) {
					return '__' + prefix + varCounter++;
				};
				while ((startIndex = data.indexOf('<{')) != -1) {
					endIndex = data.indexOf('}>');
					
					var result = '';
					var code = '(function(){' +
						data.substring(startIndex + 2, endIndex) +
					'})()';
					try {
						result = vm.runInNewContext(code, sandbox);
					} catch (e) {
						result = e.toString();
					}
					
					html += data.substring(0, startIndex);
					if (result !== undefined) {
						if (typeof(result) === 'function') {
							/* TODO: insertId's don't work well asyncronously because they're not correctly scoped */
							var insertId = newVarName('i');
							html += '<script id="' + insertId +
								'">_insertId="' + insertId + '";';
							if (result.isBound) {
								var context = result.boundObject;
								var func = result.innerFunction;
								var varName = newVarName('v');
								browserutils.transfers[varName] = context;
								html += 'document.write((' + func.toSource() +
									').call(' + varName + ').toString())';
							} else {
								html += 'document.write((' + result.toSource() +
									')().toString())';
							}
							html += '</script>';
						} else {
							html += result.toString();
						}
					}
					data = data.substring(endIndex + 2);
				}
				html += data;
				
				/*
				 * Variables in transfers are currently embedded as global variables.
				 * eventually all functions and variables should be enclosed in a
				 * separate scope (insert and write help to do achieve this while
				 * still easily manipulating the DOM from inline code).
				 */
				var transfers = browserutils.transfers;
				/* TODO: Port insert and write to server-side */
				transfers['utils'] = {
					insert: function(node) {
						var dest = document.getElementById(_insertId);
						dest.parentNode.insertBefore(node, dest);
					},
					write: function(text) {
						this.insert(document.createTextNode(text));
					}
				};
				var transferScript = '<script>';
				for (var name in transfers) {
					transferScript += name + '=' + transfers[name].toSource() + ';';
				}
				transferScript += '</script>';
				html = transferScript + html;
				browserutils.transfers = {};

				self.length = html.length;

				oPar.start();
				oPar.data(html);
				oPar.end(true);
			});
		}
	});
	/**
	 * @memberof $jn.TStaticFile
	 * @static
	 */
	$jn.TStaticFile.mime = function(ext){
		switch(ext.toLowerCase()) {
			case "htm": case "html": case "jshtml": return ["text/html", "utf-8"];
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