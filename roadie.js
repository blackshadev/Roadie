/** junction.js
 * The main entrypoint for a require call. Wraps up all required packages
 */
"use strict";
var o = require("./core.js")
var s = require("./Server.js");
var w = require("./WebService.js");
var h = require("./Http.js");
var c = require("./Config.js");

module.exports = {
	Server: s.Server,
	ServerConfig: s.ServerConfig,
	WebService: w.WebService,
	HttpError: h.HttpError,
	ConfigServer: c.ConfigServer,
	ConfigClient: c.ConfigClient,
	Object: o.Object,
	extend: o.extend
};