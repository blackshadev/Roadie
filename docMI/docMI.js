/*@Namespace*/
$doc = {};
$doc = ( function($doc) {

	/** Main empty object, jst like the java Object class
	* @constructor TObject
	* @memberof $doc */
	$doc.TObject = function() {};
	$doc.TObject.prototype.create = function() {};
	$doc.TObject.prototype.destroy = function() {
		return null;
	};
	$doc.TObject.prototype.className = "TObject";
	$doc.TObject.prototype.superClass = null;
	$doc.TObject.prototype.toString = function() {
		return "[Object " + this.className + "]";
	};
	/** Gets the inherited functions of the parent */
	$doc.TObject.prototype.inherited = function() {
		var o = arguments.callee.caller.$inherited;
		if (!o) {
			errmsg("inherited function does not exist class:" + this.className);
		}
		return o;
	};

	$doc.TObject.override = function(meth, fn) {
		this.prototype[meth] = fn;
		fn.$inherited = this.prototype.superClass;
	};
	/** Extends the class
	* @param {string} className Name of the class
	* @param {object} objDef defenition of class. Functions and properties. */
	$doc.TObject.extends = function(className, objDef) {
		var classDef = function() {
			if (arguments[0] !== $doc.TObject) {
				this.create.apply(this, arguments);
			}
		};
		var proto = new this($doc.TObject);

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

	var fs = require("fs");
	/*@class */
	$doc.TMain = $doc.TObject.extends("TMain", {
		/* @External */
		params: null,
		depth: 0,
		path: "",
		/* @Internal */
		acceptedExts: ["js"],
		maxDepth: 1,
		create: function(params, depth, path) {
			this.params = params;
			this.depth = depth || 0;
			this.path = path || "";

			if(this.depth > this.maxDepth)
				return;

			var self = this;
			this.params.forEach(function(param) {
				self.checkPath(self.path + param);
			});
		},
		checkPath: function(path) {
			//console.log("stat: " + path);

			var self = this;
			fs.stat(path, function(err, stat) {
				if(err) { console.log(path + ": " + err.toString() ); return; }
				if(stat.isDirectory())
					self.walkDir(path);
				else {
					var ext = path.substr(path.lastIndexOf('.') + 1).toLowerCase();
					if(ext.length > 0 && self.acceptedExts.indexOf(ext) > -1) {
						new $doc.TFileDoccer(path);
					}
				}
			});
		},
		walkDir: function(path) {
			var self = this;
			fs.readdir(path, function(err, files) {
				if(err) { console.log(path + ":" + err.toString()); return; }
				new $doc.TMain(files, self.depth + 1, path + "/");
			});
		}
	});

	$doc.TFileDoccer = $doc.TObject.extends("TFileDoccer", {
		/* @External */
		path: "",
		/* @Internal */
		constLineNum: 0, // constructor line number
		props: null, // {arr} property list
		meths: null, // {arr} methods list
		readLine: require("readline"), // {obj} nodejs readLine
		rl: null,
		depth: 0,
		classRegExp: null,
		nsRegExp: null,
		create: function(path) {
			this.classRegExp = new RegExp(/(.+)\.(.+)\s*=\s*(.+)\.(.+)\.extends\(\".+\"\,\s+\{(.*)\}\);/); // still needs to check for beginning of a new class
			this.nsRegExp = new RegExp(/\/\*\s*\@namespace\s*(.*)\n*\*\/\n(.*)\s*=\s*\{\};/i);
			console.log("Should docced: " + path);
			var stream = require("stream");

			var readStream = fs.createReadStream(path);
			var writeStream = new stream();
			writeStream.readable = true;
			writeStream.writeable = true;

			this.rl = this.readLine.createInterface({
				input: readStream,
				output: writeStream,
				terminal: false
			});
			var self = this;
			this.rl.on("line", function(line) {
				
			});
		}
	});

	$doc.TDocStructure = $doc.TObject.extends("TDocStructure", {
		/* @Internal */
		className: "",
		constrLineNum: 0,
		props: null, // {arr} property list
		methods: null, // {arr} methods list
		create: function(classHeader) {

		},
		feedLine: function() {

		}
	});

	new $doc.TMain(process.argv.slice(2), 0);
})($doc);
