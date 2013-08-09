$obj = {};

$obj = ( function($obj) {

	$obj.TObject = function() {};

	$obj.TObject.prototype.create = function() {};
	$obj.TObject.prototype.destroy = function() {
		return null;
	};
	$obj.TObject.prototype.className = "TObject";
	$obj.TObject.prototype.superClass = null;
	$obj.TObject.prototype.toString = function() {
		return "[Object " + this.className + "]";
	};

	$obj.TObject.prototype.inherited = function() {
		var o = arguments.callee.caller.$inherited;
		if (!o) {
			errmsg("inherited function does not exist class:" + this.className);
		}
		return o;
	};

	$obj.TObject.override = function(meth, fn) {
		this.prototype[meth] = fn;
		fn.$inherited = this.prototype.superClass;
	};

	$obj.TObject.extends = function(className, objDef) {
		var classDef = function() {
			if (arguments[0] !== $obj.TObject) {
				this.create.apply(this, arguments);
			}
		};
		var proto = new this($obj.TObject);

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

	$obj.TList = $obj.TObject.extends("TList", {
		idxPrefix: null,
		idxCounter: 0,
		idxFld: null,
		elType: null,
		items: null,
		itemsArray: [],
		create: function(oPar) {
			this.idxFld = oPar.idxFld || null;
			this.idxPrefix = oPar.idxPrefix || "Li_";
			this.items = {};
			if (oPar.elType && oPar.elType instanceof Function) {
				this.elType = oPar.elType;
			}
		},
		add: function(el) {
			var idx;
			if (this.idxFld) {
				idx = el[idxFld];
			} else {
				idx = this.idxPrefix + this.idxCounter++;
			}
			if (this.items[el[this.idxFld]]) {
				throw new Error(this.idxFld + " is not an unique field.");
			}
			this.items[idx] = el;
			this.itemsArray.push(el);
		},
		toString: function() {
			return this.itemsArray.toString();
		}
	});

	$obj.TServerFile = $obj.TObject.extends("TServerFile", {
		fullName: "",
		filePath: "",
		fileName: "",
		ext: "",
		mimeType: "",
		encodeType: null,
		length: 0,
		create: function(fullName) {
			this.fullName = fullName;
			this.parseFile();
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

			var mime = $obj.TServerFile.mime(this.ext);
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
		}
	});
	$obj.TServerFile.mime = function(ext){
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

	$obj.TServerRequest = $obj.TObject.extends("TServerRequest", {
		baseDir: "public",
		req: null,
		method: null,
		file: null,
		header: null,
		body: "",
		create: function(req, resp) {
			this.inherited().create.call(this, req);
			this.req = req;
			this.resp = resp;
			this.header = {
				code: 200,
				options: {'Content-Type': 'text/plain'}
			};

		},
		parseRequestUrl: function() {
			var self = this;
			var file = "./" + this.baseDir + this.req.url;
			this.file = new $obj.TServerFile(file);
			this.file.open(function(err, data) {
				if (err) {
					if(self.fileError(err) === false) return;
				} else {
					self.body = data;
					this.length = data.length;
				}

				self.end();
			});
		},
		fileError: function(err) {
			switch (err.errno) {
				case 28:
					this.req.url += "index.htm";
					this.parseRequestUrl();
					return false;
				case 34:
					this.header.code = 404;
					break;
				default:
					this.header.code = 500;
					break;
			}
			this.file.mimeType = "text/html";
			this.body = $obj.TServerRequest.errorPage(this.header.code);
		},
		end: function() {
			this.resp.writeHead(this.header.code, { 'Content-Type': this.file.mimeType, 'Content-Length': this.body.length });
			this.resp.end(this.body, this.file.method);
		},
		start: function() {
			this.parseRequestUrl();
		}
	});
	$obj.TServerRequest.errorPage = function(code) {
		switch (code) {
			case 404:  return "<h1>Not Found</h1><p>The page you requested could not be found</p>";
			default: return "<h1>Internal Server Error</h1><p>Our server encountered an internal error.</p>";
		}
	};


	return $obj;
})($obj);
exports.$obj = $obj;