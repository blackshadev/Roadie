"use strict";
var webservice_1 = require("./webservice");
var http_1 = require("./http");
exports.WebService = webservice_1.WebService;
exports.Server = http_1.RoadieServer;
exports.WebMethod = http_1.WebMethod;
function setDefaultServer(serv) { http_1.RoadieServer.Default = serv; }
exports.setDefaultServer = setDefaultServer;
//# sourceMappingURL=index.js.map