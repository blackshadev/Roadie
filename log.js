"use strict";
module.exports = function(tag, msg) {
    var n = new Date();
    console.log("[" + tag + " | " + n.toLocaleDateString() + " " + n.toLocaleTimeString() + "]: " + msg);
};