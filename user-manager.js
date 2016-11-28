'use strict';

const EventEmitter = require('events');
const AppManager = require('./app-manager.js');

class UserManager extends EventEmitter {
	constructor(nomadServer) {
		super();
		this.d_clientList = [];
		this.d_clientMap = {};
		this.d_activeClient = null;
		this.d_appManager = new AppManager();
        this.d_nomadServer = nomadServer;
	}

	get activeClient() {
		return this.d_activeClient;
	}

	registerUser(clientId, socket) {
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

		// This should probably just handle all the necessary events without the main app knowing
		socket.on('compile', function (src) {
			if (this.d_appManager.appRunning) {
				this.d_appManager.stopApp();
			}

			this.d_appManager.compileAndRun(src, clientId, socket);
		}.bind(this));
        
        socket.on('stopApp', function () {
            if (this.d_appManager.appRunning) {
                this.d_appManager.stopApp();
            }
        }.bind(this));

		// Set mode that the robot program will use
		socket.on('mode', function (mode) {
			this.d_nomadServer.setRobotMode(mode);
		}.bind(this));

		// Relinquish position in queue and insert at the back
		socket.on('relinquish', function () {
			
		}.bind(this));

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
        
        if (this.d_appManager.appRunning) {
            this.d_appManager.stopApp();
        }
        
        // Cleanup
        this.d_appManager.cleanup(clientId);
        
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