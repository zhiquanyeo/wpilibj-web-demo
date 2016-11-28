'use strict';

const EventEmitter = require('events');

class UserManager extends EventEmitter {
	constructor() {
		super();
		this.d_clientList = [];
		this.d_clientMap = {};
		this.d_activeClient = null;
	}

	get activeClient() {
		return this.d_activeClient;
	}

	registerUser(clientId, socket, eventHandlers) {
		this.d_clientList.push({
			id: clientId,
			socket: socket
		});

		this.d_clientMap[clientId] = socket;

		// Inform the web app of it's ID
		socket.emit('registration', clientId);

		socket.on('disconnect', function () {
			this.unregisterUser(clientId);
		}.bind(this));

		// App specific events
		if (eventHandlers) {
			for (var evt in eventHandlers) {
				socket.on(evt, eventHandlers[evt].bind(null, clientId, socket));
			}
		}

		this.updateClientStatus();
	}

	unregisterUser(clientId) {
		for (var i = 0; i < this.d_clientList.length; i++) {
			if (this.d_clientList[i].id === clientId) {
				this.d_clientList.splice(i, 1);
				break;
			}
		}

		delete this.d_clientMap[clientId];

		this.updateClientStatus();
	}

	updateClientStatus() {
		// See if the first element in the list is the same as the active
		if (this.d_clientList.length > 0) {
			if (this.d_clientList[0].id !== this.d_activeClient) {
				// New active client
				this.d_activeClient = this.d_clientList[0].id;
				this.d_clientMap[this.d_activeClient].emit('active');

				this.emit('activeUser', {
					id: this.d_activeClient,
					socket: this.d_clientMap[this.d_activeClient]
				});
			}

			// Inform the rest of the users of their position in line
			for (var i = 1; i < this.d_clientList.length; i++) {
				this.d_clientList[i].socket.emit('inactive', {
					position: i+1
				});
			}
		}
		else {
			this.d_activeClient = null;
		}
	}
}

module.exports = UserManager;