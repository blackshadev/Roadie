/** Config.js
 *  Author: Vincent Hagen
 *
 *  Classes which can be used to control a junction server.

 */

"use strict";

var o = require("./core.js");
var net = require("net");
var rl = require('readline');
var cp = require("child_process");

module.exports = (function() {

	// A ConfigServer is bound to a junction server and listens for config clients
	var cs = o.Object.extend({
		port: 4242, // Port to listen to
		acceptLocalOnly: true, // only accept local IPs
		server: null, // reference to the server
		create: function(serv, oPar) {
			this.server = serv;

			this.port = oPar.port || this.port;
			this.acceptLocalOnly = oPar.acceptLocalOnly || this.acceptLocalOnly;
		},
        // Starts the server by listening to the specified port
		start: function() {
			var h = this.handleConnection.bind(this);
			net.createServer(h).listen(this.port);
            console.log("[Config] Started listening on " + this.port);

		},
        /* Handles a incomming connection
         * sock: net.Socket instance of the incomming connection */
		handleConnection: function(sock) {
			if(this.localConfigOnly && !isLocalIp(sock.remoteAddress)) {
                console.log("[Config] Refused client " + sock.remoteAddress);
                sock.end("refused");
            }

            console.log("[Config] client trying to connect from " + sock.remoteAddress);

            var self = this;
            sock.on('data', function(dat) {
                self.handleMessage(sock, dat.toString());
            });

            sock.on('close', function() {
                console.log("[Config] client disconnected");
            });
            sock.on('error', function() {});
		},
        /* Handles a incomming message of a given socket
         * sock: net.Socket instance from which the message was received
         * mess: a string representation of the send message */
		handleMessage: function(sock, mess) {
			var cmd = mess.trim().split(' ');

            // Handle the message as a command
            switch(cmd[0].toLowerCase()) {
                case 'reload':  // reloads the server, routemaps and resources
                    console.log("[Config] Reload requested");
                    this.server.reload();
                    console.log("[Config] Reloaded");
                    sock.write("reloaded");
                break;
                case 'list': // List the resources or routes
                    var str = "\n";
                    if(cmd.length < 2)
                        return sock.write("usage: list resource|route");

                    if(cmd[1].indexOf('res') === 0)
                        str = "Resources: \n" + this.server.listResources();
                    if(cmd[1].indexOf('rou') === 0)
                        str =  "Routes: \n" + this.server.listRoutes();

                    sock.write(str);
                    return;
                case 'ping':
                    sock.write("PONG");
                    break;
                case 'startfile':
                    sock.write(process.argv[1]);
                    break;
                default:
                    sock.write("Unreconized request");
                break;
            }
		}

	});

	// a ConfigClient is used to config a junction server
	var cc = o.Object.extend({
        host: null,
        port: 0,
        socket: null,
        prompt: null,
        create: function(oPar) {
            this.port = oPar.port || null;
            this.host = oPar.host || null;
            this.onError = oPar.onError || (function() {});


            this.prompt = rl.createInterface(process.stdin, process.stdout);

            this._outHandler = this.handleOutMessage.bind(this);

        },
        // Starts the ConfigClient by checking if al required properties are set
        // if not is asks for the missing few
        start: function() {
            var arr = [
                ["Hostname to the junction server   > ", 'host'],
                ["Config port of the junction server> ", 'port']
            ]

            var self = this;

            // Producer, asks for the next question
            function p() {
                var q = arr.shift();

                // No more setup questions
                if(!q) return done();
                // skip if the property is already set
                if(self[q[1]]) return p();

                self.prompt.question(q[0], function(dat) {
                    self[q[1]] = dat;

                    p();
                });
            }

            function done() {
                self.connect();
            }

            p();

        },
        onError: function() {},
        connTries: 0, // Tries taken to connect
        // Tries to connect to the server with the given hostname and port
        connect: function() {
            this.socket = new net.Socket();
            var self = this;

            this.connTries++;
            this.socket.on("error", function(err) {
                self.onError(err);
                console.log("[Error] " + err);
                self.retry();
            });
            this.socket.connect(this.port, this.host, function() {
                self.connTries = 1;
                console.log("Connected to " + self.host + ":" + self.port);
                self.send("startfile", function(d) {
                    self._heartBeatFile = d;
                    console.log("Server started with " + d);
                    self.query();
                })

                // self.query();
            });
        },
        retry: function() {
            console.log(this.connTries % 3);
            if(this._heartBeatFile && this.connTries % 3 === 0)
                this.startServer();

            console.log("Try " + this.connTries + " failed, Retrying connection in 5 seconds");
            setTimeout(this.connect.bind(this), 5000);

        },
        // Sends a message to the server
        send: function(mess, cb) {
            this.socket.write(mess);
            var self = this;

            // Wait for response and echo the response before quering for input
            this.socket.once("data", function(d) {
                console.log("[server] " + d.toString());
                if(cb) cb(d);
                self.query();
            });
        },
        // Exits the shell
        exit: function() {
            this.socket.destroy();
            process.exit();
        },
        // Query the user for input
        query: function() {
            this.prompt.question("?> ", this._outHandler);
        },
        // Handle a typed in message
        handleOutMessage: function(mess) {
            var cmd = mess.split(' ');
            var self = this;

            switch(cmd[0]) {
                case '?': case 'h': case 'help':
                    console.log(this.help()); break;
                case 'exit': case 'quit':
                    this.exit(); return;
                case 'list': case 'l':
                    this.send('LIST ' + (cmd[1] || "")); return;
                case 'reload':
                    this.send('RELOAD'); return;
                case 'ping':
                    this.send("PING"); return;
                case 'heartbeat':
                    this.heartbeat(cmd[1], cmd[2]); return;
                default:
                    console.log("Unreconized request, try use the \'help\' command"); break;
            }

            this.query();
        },
        _heartBeatFile: null,
        heartbeat: function(a, b) {
            if(a === "disable")
                this._heartBeatFile = null;
            else if(a === "enable")
                this._heartBeatFile = b || "startServer.js";


            this.query();
        },
        // Forces the server to start
        startServer: function() {
            console.log("Trying to start the server")
            cp.exec("start node " + this._heartBeatFile);
            this.query();
        },
        // Output the available commands
        help: function() {
            return  "Available commands:\n" +
                    "help\t\tPrint out this text\n" +
                    "exit\t\tExit this program\n" +
                    "reload\t\tReloads the server\n" +
                    "list {resources|routes}\t\tLists the loaded resources or routes\n" +
                    "ping\t\tPings the server\n" +
                    "heartbeat {enable|disable} {js}\tRestarts the server if needed with given js file to execute\n" +
                    "\n";
        }
    });

    // Helper function to tell what an localIP is.
	function isLocalIp(ip) {
        var p = ip.split(".").map(function(x) { return parseInt(x); });

        return  ip === "127.0.0.1" ||
                p[0] === 10 ||
                (p[0] === 192 && p[1] === 168) ||
                (p[0] === 172 && p[1] > 15 && p[1] < 32);
    }

	return { ConfigServer: cs, ConfigClient: cc };
})();
