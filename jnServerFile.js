var $jn = require("./core.js");
/**
 * Wrapper for dynamic files. This class makes dynamic files easy to handle,
 *
 * Features:
 * - Client header parsing
 * - Easy accessing of clientHeaders, response Headers, and output
 * - Output given by the printed values
 *
 * Defaults:
 * - response::headers::Content-Type: text/html
 */
$jn = (function($jn) {
	$jn.jnAbstract = $jn.TObject.extends("jnAbstract", {
		clientHeaders: null,
		response: null,
		bodyFn: null,
		streamPars: null,
		serverFile: null,
		content: null,
		queue: null,
		compressionFlag: false,
		create: function(serverFile, streamPars) {
			this.streamPars = streamPars;
			this.serverFile = serverFile;
			this.serverRequest = serverFile.serverRequest;

			this.content = "";
			this.clientHeaders = new jnClient(serverFile.serverRequest);
			this.response = new jnResponse();

			var self = this;
			this.queue = new jnWait(0, function() { self.send(); });
		},
		setCookie: function(key, value, args, flags) {
			return this.response.addCookie(new $jn.TCookie(key, value, args, flags));
		},
		setHeader: function(key, type) { // shortcut
			this.response.setHeader(key, type);
		},
		getClientHeaders: function() {
			return this.clientHeaders.headers;
		},
		send: function() {
			if(!this.queue.ready()) return;

			if(this.compressionFlag) {
				this.compressedSend();
				return;
			}
			this.sendContent();
		},
		sendHeaders: function() {
			var headers = this.response.headers();
			var respHeader = this.serverRequest.respHeader;
			for(var key in headers)
				respHeader.headers[key] = headers[key];
			this.serverFile.length = this.content.length;
			this.serverFile.mimeType =
				respHeader.headers["Content-Type"] || "text/html";

			this.streamPars.start(true);
		},
		sendContent: function() {
			this.sendHeaders();
			this.streamPars.data(this.content);
			this.streamPars.end(true);
		},
		/** Sets the compression flag and header, 
		 * @param {Boolean} enabled enabled or disabled the compression
		 */
		setCompression: function(enabled) {
			this.compressionFlag = enabled ?
				this.serverRequest.getSupportedCompressionMethods() : 0;

			// Set header value or remove it (undefined)
			var encContent = this.compressionFlag & 1? "deflate" :
				this.compressionFlag & 2 ? "gzip" : undefined;
			this.response.setHeader("Content-Encoding", encContent);
			// Close connection to let the browser know, nothing else is coming
			// this.response.setHeader("Connection","closed");
		},
		/** Compresses the given content according to the compressionFlag.
			The data needs to be compressed first, than recalculate the actual
			size of the data before sending it.
			Todo: Chunked sending? */
		compressedSend: function() {
			var self = this;
			var zlib = require("zlib");
			var dataBuffer = "";

			var compressor = this.compressionFlag & 1 ?
				zlib.createDeflate() : zlib.createGzip();
			compressor.on("data", function(data) { dataBuffer += data.toString("binary"); });
			compressor.on("end", function() {
				self.content = new Buffer(dataBuffer, "binary");
				self.length = self.content.length;

				self.sendContent();
			});

			compressor.write(this.content);
			compressor.end();

		}
	});
	
	$jn.jnScript = $jn.jnAbstract.extends("jnScript", {
		fs: require('fs'),
		vm: require('vm'),
		create: function() {
			this.inherited().create.apply(this, arguments);
		},
		exec: function() {
			var self = this;
			var sandbox = require('./jnFunctions.js')(this);
			var context = self.vm.createContext();
			$jn.extend(context, sandbox);
			/* Files can be cached (compiled once and stored in a Script object) */
			self.fs.readFile(self.serverFile.fullName, function (err, data) {
				try {
					if (err) throw err;
					self.vm.runInNewContext(data, context);
				} catch (e) {
					self.content += e.toString();
				}
				self.send();
			});
		}
	});

	$jn.TCookie = $jn.TObject.extends("TCookie", {
		key: "",
		value: "",
		args: null,
		flags: null,
		create: function(key, value, args, flags) {
			if(arguments.length === 1) {
				// console.log("Cookie should be parsed: " + key);
			}
			this.key = key;
			this.value = value;
			this.args = args || {};
			this.flags = flags || [];

		},
		toString: function() {
			var out = this.key + "=" + this.value;
			for(var key in this.args)
				out += "; " + key + "=" + this.args[key];
			for(var iX = 0; iX < this.flags.length; iX++)
				out += "; " + this.flags[iX];
			return out;
		},
		setLifeTime: function(val) {
			var parseTime = function(key) {
				var m = new RegExp('\\s*(-?\\s*\\d+)\\s*' + key + '(s)?','i').exec(val);
				return m? parseFloat(m[1].trim(),10) : 0;
			};
			var toTime = function(obj) {
				return obj.sec * 1000 +
				obj.min * 60000 +
				obj.hour * 3600000 +
				obj.day * 86400000 +
				obj.week * 604800000 +
				obj.month * 2592000000 +
				obj.year * 31557600000;
			};
			var res = {
				sec: parseTime("sec(ond)?"),
				min: parseTime("min(ute)?"),
				hour: parseTime("hour"),
				day: parseTime("day"),
				week: parseTime("week"),
				month: parseTime("month"),
				year: parseTime("year")
			};
			var date = new Date();
			date.setTime(date.getTime() + toTime(res));
			this.setArg("Expires", date.toUTCString());
			return date;
		},
		setArg: function(key, val) {
			this.args[key] = val;
		}
	});

	var jnResponse = $jn.TObject.extends("jnResponse", {
		headerObj: null,
		cookies: null,
		create: function() {
			this.headerObj = {};
			this.cookies = {};
			this.setHeader("Content-Type","text/html");
		},
		headers: function() {
			var obj = $jn.extend({}, this.headerObj);
			obj["Set-Cookie"] = [];
			for( var key in this.cookies)
				obj["Set-Cookie"].push(this.cookies[key].toString());
			return obj;
		},
		setHeader: function(type, value) {
			if(value === undefined) {
				delete this.headerObj[type];
				return;
			}
			this.headerObj[type] = value;
		},
		addCookie: function(cookie) {
			this.cookies[cookie.key] = cookie;
			return cookie;
		}
	});

	var jnClient = $jn.TObject.extends("jnClient", {
		headers: null,
		create: function(serverRequest) {
			this.headers = serverRequest.getDynamicHeaders();
		},
		toString: function() {
			return this.headers.toSource();
		}
	});

	/* NonBlocking semaphore, for waiting for asynch data */
	var jnWait = $jn.TObject.extends("jnWait", {
		counter: 0,
		fn: null,
		create: function(init, fn) {
			this.counter = init || this.counter;
			this.fn = fn;
		},
		add: function(num) {
			num = num || 0;
			this.counter += num < 1 ? 1 : num;
		},
		sub: function(num) {
			num = num || 0;
			this.counter -= num < 1 ? 1 : num;
			if(this.ready() && this.fn)
				this.fn();
		},
		ready: function() {
			return this.counter < 1;
		}
	});

	return $jn;
})($jn);
module.exports = $jn.jnFunction;