"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./http");
var webservice_1 = require("./webservice");
exports.WebService = webservice_1.WebService;
var http_2 = require("./http");
exports.Server = http_2.RoadieServer;
exports.WebMethod = http_2.WebMethod;
exports.HttpError = http_2.HttpError;
exports.HttpVerb = http_2.HttpVerb;
var routemap_1 = require("./routemap");
exports.Router = routemap_1.Router;
exports.StaticRouter = routemap_1.StaticRouter;
function setDefaultServer(serv) { http_1.RoadieServer.default = serv; }
exports.setDefaultServer = setDefaultServer;
//# sourceMappingURL=index.js.map