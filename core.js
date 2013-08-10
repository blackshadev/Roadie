$jn = {};

$jn = ( function($jn) {

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
		create: function(oPar) {
			this.items = {};
			this.itemsArray = [];
		},
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
		toString: function() {
			return this.itemsArray.toString();
		}
	});

	$jn.TServerCache = $jn.TList.extends("TServerCache", {
		elType: $jn.TCacheEntry,
		idxFld: "fullName",
		add: function(oPar) {
			this.inherited().add.call(this, new $jn.TCacheEntry(oPar));
		}
	});

	$jn.TCacheEntry = $jn.TObject.extends("TCacheEntry", {
		fillName: "",
		filePath: "",
		fileName: "",
		reroute: "",
		mimeType: "",
		encodeType: "",
		ext: "",
		lastModified: null,
		length: null,
		create: function(oPar) {
			this.fullName = oPar.fullName;
			this.filePath = oPar.filePath;
			this.fileName = oPar.fileName;
			this.ext = oPar.ext;
			this.mimeType = oPar.mimeType;
			this.encodeType = oPar.encodeType;
			this.length = oPar.length;
			this.reroute = oPar.reroute;
		},
		toString: function() {
			return "TCacheEntry: ["+this.fullName+"]: reroute{"+this.reroute+"}";
		}
	});

	$jn.TServer = $jn.TObject.extends("TServer", {
		cluster: null,
		connectionWorkers: 0,
		compressionWorkers: 0,
		port: 80,
		location: '127.0.0.1',
		baseDir: 'public',
		cache: null,
		create: function(oPar) {
			this.port = oPar.port || this.port;
			this.location = oPar.location || this.location;
			this.baseDir = oPar.baseDir || this.baseDir;
			this.cache = new $jn.TServerCache();

			this.cluster = require("cluster");
			this.connectionWorkers = oPar.connectionWorkers || require("os").cpus().length-1;
			this.compressionWorkers = oPar.compressionWorkers || 1;
		},
		start: function() {
			var self = this;
			if(this.cluster.isMaster) { // lets create some child processes
				console.log(this.connectionWorkers);
				for(var i = 0; i < this.connectionWorkers; i++)
					this.cluster.fork();

				this.cluster.on("fork", function(worker) {
					console.log("Worker forked (nasty) with pid " + worker.process.pid);
				});
				this.cluster.on("exit", function(worker) {
					console.log("Worker died (tip) with pid " + worker.process.pid);
				});
			} else {
				require('http').createServer(function(req, resp) {
					self.handleRequest(req, resp);
				}).listen(this.port);
				console.log('Server running at pid:' + this.cluster.worker.process.pid + ' http://'+this.location+':'+this.port+'/');
			}
		},
		handleRequest: function(req, resp) {
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
		create: function(server, req, resp) {
			this.inherited().create.call(this, req);
			this.req = req;
			this.resp = resp;
			this.oUrl = require('url').parse(this.req.url, true);
			this.server = server;
			this.header = {
				code: 200,
				headers: {'Content-Type': 'text/plain'}
			};

		},
		parseRequestUrl: function() {
			var self = this;
			var file = "./" + this.server.baseDir + this.oUrl.pathname;
			this.file = new $jn.TServerFile(this.server, file);
			
		},
		fileError: function(err) {
			switch (err.errno) {
				case 28:
					this.oUrl.pathname += "index.htm";
					this.file.reroute = "./" + this.server.baseDir + this.oUrl.pathname;
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
		end: function() {
			this.resp.writeHead(this.header.code, this.header.headers);
			this.resp.end(this.body, this.file.method);
		},
		start: function() {
			var self = this;
			this.parseRequestUrl();
			this.file.pipe(this.resp, {
					start: function(stat) {
						self.header.headers["Content-Type"] = self.file.mimeType;
						self.header.headers["Content-Length"] = self.file.length;
						self.resp.writeHead(self.header.code, self.header.headers);
						//console.log("Writen headers: length<"+self.file.length+">, mime<"+self.file.mimeType+">");
					},
					data: function(data) { self.file.length+=data.length; self.resp.write(data); },
					end: function() {self.resp.end(); },
					error: function(err) { self.fileError(err); }
				});
		}
	});
	$jn.TServerRequest.errorPage = function(code) {
		switch (code) {
			case 404:  return "<h1>Not Found</h1><p>The page you requested could not be found</p>";
			default: return "<h1>Internal Server Error</h1><p>Our server encountered an internal error.</p>";
		}
	};

	$jn.TServerFile = $jn.TObject.extends("TServerFile", {
		server: null,
		fullName: "",
		filePath: "",
		fileName: "",
		ext: "",
		mimeType: "",
		encodeType: null,
		length: 0,
		lastModified: null,
		isChached: false,
		reroute: "", // only used if a file (directory) gets rerouted to another file 
		fs: require("fs"),
		create: function(server,fullName) {
			this.fullName = fullName;
			this.server = server;
			var cache = this.server.cache.items[fullName];
			this.parseFileCache(cache); // fill result in a parseFile cal if cache is empty

		},
		parseFileCache: function(entry) {
			if(!entry) { this.parseFile(); return; }
			this.isCache = true;
			for(var iX in entry) {
				this[iX] = entry[iX];
			}
			//console.log("cache found item:" + entry.fullName);
		},
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
			this.encodeType = mime[1];
		},
		toString: function() {
			return "File: " + this.fileName + "\r\n" + "Path: " + this.filePath +
				"\r\n" + "ext: " + this.ext +
				"\r\n" + "MimeType: " + this.mimeType +
				"\r\n" + "EncodeType: " + this.encodeType +
				"\r\n";
		},
		open: function(fn) {
			require("fs").readFile(this.fullName, {encode: this.encodeType, flag: 'r'}, fn);
		},
		pipe: function(dest, oPars) {
			if(this.isCache)
				this.cacheHit(dest, oPars);
			else
				this.cacheMiss(dest, oPars);
		},
		createStream: function(oPars) {
			var fstream = this.fs.createReadStream(this.fullName);
			for(var type in oPars) {
				fstream.on(type, oPars[type]);
			}
		},
		cacheHit: function(dest, oPars) {
			this.followRoute();
			oPars.start({size: this.length});
			delete oPars.start;
			this.createStream(oPars);
		},
		followRoute: function() {
			var cache = this.server.cache.items[this.fullName];
			while(cache.reroute) {
				cache = this.server.cache.items[cache.reroute];
			}
			this.parseFileCache(cache);
		},
		cacheMiss: function(dest, oPars) {
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
					self.server.cache.add(self);
				}
			});
		}
	});
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