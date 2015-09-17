/** Resource.js
 * 	Author: Vincent Hagen
 *
 * 	Wraps resources in Junction, allows them to be read (static) or executed
 */
"use strict";
var o = require("./core.js");
var fs = require("fs");
var HttpError = require("./Http.js").HttpError;
var log = require("./log.js");


module.exports = (function() {

	var Resource, StaticResource, ScriptResource;

	// General class structure of a Resource, Should not be instanciated.
	Resource = o.Object.extend({
		fname: null, // file name of the resource.
		isLoaded: false, // Is the file loaded
		create: function(fname) {

			this.fname = fname;

			this.load();
		},
		// Loads the file
		load: function() { 
			this.isLoaded = true;
			this.onLoadend(); 
		},
		// triggered after file is loaded
		onLoadend: function() { },
		/* Runs the resource.
		 * ctx: context to which the resource should send to
		 * Returns whenever loading succeeded or not. */
		run: function(ctx) {
			// _error has occured while loading
			if(this._err) {
				ctx.error(this._err);
				return false;
			}

			// Wait until the resource is loaded
			if(!this.isLoaded) {
				this.onLoadend = this.run.bind(this, ctx);
				return false;
			}

			return true;
		},
		/* Sets an HttpError 
		 * err: Error object, either nodeJs error or HttpError */
		error: function(err) {
			if(!( err instanceof HttpError) ) err = new HttpError(err);
			this._err = err;
			this.onLoadend();
		}
	});
	/* Constructor function to create an resource, resources with an ":" in 
		their name are considerd a ScriptResource, the rest a Static Resource */
	Resource.create = function(fname, uri) {
		log("Resource", "Creating: " + fname);

		// Get the method out the fname if it has any
		var idx = fname.lastIndexOf(".js:");
		var meth
		if( idx !== -1) {
			meth = fname.substr(idx + 4);
			fname = fname.substr(0, idx + 3);
		}
		return new ScriptResource(fname, meth);
	};
	/* Reload all resources */
	Resource.reloadAll = function() {
		// StaticResource.reloadAll();
		ScriptResource.reloadAll();
	};
	/* Lists all loaded resources
	 * Note: For now only ScriptResources are really loaded */
	Resource.list = function() {
		return Object.keys(ScriptResource.all).join("\n");
	}

	// Describes a ScriptResource
	ScriptResource = Resource.extend({
		method: null, // Method to execute
		_classDef: null, // reference to the required class
		create: function(fname, method) {
			_super(ScriptResource).create.call(this, fname);
			
			this.method = method;
		},
		// Loads the ScriptResource by requiring the given file
		load: function() {
			this.ClassDef = require(this.fname);
			ScriptResource.all[this.fname] = true;

			_super(ScriptResource).load.call(this);
		},
		/* Runs the method of the given script by instanciating the class
		 * and running the given method of that instance with the context.
		 * ctx: HttpContext of the connecting client
		 */
		run: function(ctx) {
			if(_super(ScriptResource).run.call(this, ctx) === false) return false;

			var self = this;
			var svc;
			try {
				svc = new this.ClassDef(ctx, this.method);
				if(this.method && svc.isReady) svc[this.method]();
			} catch(err) {
				self.error = err;
				ctx.error(err);
			}
		}
	});
	// Keep track of all loaded scripts
	ScriptResource.all = {};
	// Reloads all scripts
	ScriptResource.reloadAll = function() {
		for(var k in ScriptResource.all)
			ScriptResource.reload(k);
			
		ScriptResource.all = {};		
	};
	// To reload a script is to throw away it's require.cache 
	ScriptResource.reload = function(f) {
		delete require.cache[require.resolve(f)];
	};
	

	return { Resource: Resource, ScriptResource: ScriptResource };
})();