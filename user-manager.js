const EventEmitter = require('events');
const AppManager = require('./app-manager.js');
const dgram = require('dgram');

class UserManager extends EventEmitter {
	constructor(nomadServer, workspaceDir) {
		super();
		this.d_clientList = [];
		this.d_clientMap = {};
		this.d_activeClient = null;
		this.d_workspaceDir = workspaceDir;
		this.d_appManager = new AppManager(workspaceDir);
		this.d_nomadServer = nomadServer;
		
		this.d_joystickClient = dgram.createSocket('udp4');
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
			// Verify that we are indeed the first one
            if (this.d_clientList[0].id !== clientId) {
                console.warn('Invalid relinquish command');
                return;
            }
            
            var temp = this.d_clientList[0];
            this.d_clientList.splice(0 ,1);
            this.d_clientList.push(temp);
            
            this.updateClientStatus();
		}.bind(this));

		socket.on('joystick', function(data) {
			if (this.d_clientList && this.d_clientList[0].id === clientId) {
				// TODO Send joystick data
				// [ 0xDE ][ 0xAD ][axisCount][axis data]...[buttonCount][ 3 bytes of button]
				var numAxes = data.axes.length;
				var numButtons = data.buttons.length;
				var bufferSize = 7 + (4 * numAxes); // 32 bit float
				var buf = Buffer.alloc(bufferSize);
				buf.writeUInt8(0xDE, 0);
				buf.writeUInt8(0xAD, 1);
				buf.writeUInt8(numAxes, 2);
				for (var i = 0; i < numAxes; i++) {
					var offset = (i * 4) + 3;
					buf.writeFloatBE(data.axes[i], offset);
				}
				var btnCountOffset = bufferSize - 4;
				buf.writeUInt8(numButtons, btnCountOffset);

				var buttonData = 0;
				for (var i = 0; i < numButtons; i++) {
					var btnVal = (data.buttons[i] ? 1 : 0);
					buttonData |= (btnVal << i);
				}
				var btnByte1 = (buttonData >> 16) & 0xFF;
				var btnByte2 = (buttonData >> 8) & 0xFF;
				var btnByte3 = (buttonData & 0xFF);
				buf.writeUInt8(btnByte1, btnCountOffset + 1);
				buf.writeUInt8(btnByte2, btnCountOffset + 2);
				buf.writeUInt8(btnByte3, btnCountOffset + 3);
				// build up the ints
				this.d_joystickClient.send(buf, 1120, '127.0.0.1', (err) => {
					if (err) {
						console.error(err);
					}
				});
			}
		}.bind(this))

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
        
        // This should be done in updateClientStatus is there is a change in active user
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