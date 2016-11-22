'use strict';

const EventEmitter = require('events');
const net = require('net');

class NomadDirectServer extends EventEmitter {
	constructor(port) {
		super();
		this.d_port = port;

		this.d_clients = [];

		this.d_socket = net.createServer(function (socket) {
			console.log('TCP Connection Received');
			this.d_clients.push(socket);

			socket.on('data', function (data) {
				var messageObj;
				try {
					messageObj = JSON.parse(data.toString());
				}
				catch (e) {
					// Do nothing
				}
			}.bind(this));

			socket.on('end', function () {
				console.log('socket closed');
				this.d_clients.splice(this.d_clients.indexOf(socket), 1);
			}.bind(this));
		}.bind(this));

		this.d_socket.listen(this.d_port);
	}


};

module.exports = NomadDirectServer;