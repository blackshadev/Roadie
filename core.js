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

	$jn.extend = function(src, obj) {
		for(var key in obj)
			src[key] = obj[key];
		return src;
	};

	return $jn;
})($jn);
module.exports = $jn;

/* Deze definities moeten ergens staan, maar waar? */
var _bind = Function.prototype.apply.bind(Function.prototype.bind);
Object.defineProperty(Function.prototype, 'bind', {
    value: function(obj) {
        var boundFunction = _bind(this, arguments);
		boundFunction.isBound = true;
        boundFunction.boundObject = obj;
		boundFunction.innerFunction = this;
        return boundFunction;
    }
});

/*
 * toSource is om objecten correct om te zetten tot code voor in de browser
 * bijvoorbeeld. JSON.stringify is het nèt niet, die ondersteunt geen
 * functies en is er ook niet makkelijk voor te patchen.
 */
Object.defineProperty(Object.prototype, 'toSource', {
    value: function() {
		if (typeof this === 'string' || this instanceof String) {
			return '"' + this + '"';
		} else if (Array.isArray(this)) {
			var src = '[';
			for (var i = 0; i < this.length; i++)
				src += this[i].toSource() + ',';
			return src.substr(0, src.length - 1) + ']';
		} else if (this && this.toString() === '[object Object]') {
			var src = '{';
			for (var key in this)
				src += key + ':' + this[key].toSource() + ',';
			return src.substr(0, src.length - 1) + '}';
		} else if (typeof this === 'function') {
			return this.toString().replace(/[\r\n\t]/g, '');
		} else if (this.toString) {
			return this.toString();
		}
    }
});

