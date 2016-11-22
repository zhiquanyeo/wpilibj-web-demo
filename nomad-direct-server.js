'use strict';

const EventEmitter = require('events');
const net = require('net');

var ACCEPTABLE_MODES = [
    'disabled',
    'auto',
    'teleop',
    'test'
];

class NomadDirectServer extends EventEmitter {
    constructor(port) {
        super();
        this.d_port = port;

        this.d_clients = [];

        this.d_socket = net.createServer(function (socket) {
            console.log('TCP Connection Received');
            this.d_clients.push(socket);
            socket.setNoDelay(true);

            socket.on('data', function (data) {
                this.processMessage(data);
            }.bind(this));

            socket.on('end', function () {
                console.log('socket closed');
                this.d_clients.splice(this.d_clients.indexOf(socket), 1);
            }.bind(this));

            socket.on('error', function (err) {
                console.log('socket error: ', err);
                this.d_clients.splice(this.d_clients.indexOf(socket), 1);
            }.bind(this));
        }.bind(this));

        this.d_socket.listen(this.d_port);
    }

    setDigitalValue(channel, value) {
        this.broadcast('D:' + channel + ':' + (!!value ? '1':'0'));
    }
    
    setAnalogValue(channel, value) {
        this.broadcast('A:' + channel + ':' + value.toString());
    }
    
    setPWMValue(channel, value) {
        this.broadcast('P:' + channel + ':' + value.toString());
    }
    
    setRobotMode(mode) {
        mode = mode.trim();
        if (ACCEPTABLE_MODES.indexOf(mode) === -1) {
            console.log('Invalid mode: ' + mode);
            return;
        }
        this.broadcast('M:' + mode);
    }
    
    broadcast(message) {
        // Really, only the first socket is of interest to us
        if (!this.d_clients[0]) {
            console.log('No clients!');
            return;
        }
        var client = this.d_clients[0];
        client.write(message.toString() + '\n');
    }
    
    processMessage(message) {
        var messages = message.toString().trim().split(/\r?\n/);
        var channel;
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            msg = msg.trim();
            var messageParts = msg.split(':');
        
            switch (messageParts[0]) {
                case 'D': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var dValue = (messageParts[2] === '1' ? true:false);
                    this.emit('digitalOutput', {
                        channel: channel,
                        value: dValue
                    });
                } break;
                case 'A': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var aValue = parseFloat(messageParts[2]);
                    this.emit('analogOutput', {
                        channel: channel,
                        value: aValue
                    });
                } break;
                case 'P': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var pValue = parseFloat(messageParts[2]);
                    this.emit('pwmOutput', {
                        channel: channel,
                        value: pValue
                    });
                } break;
                case 'S': {
                    // System message
                    var sysMessage = messageParts.slice(1).join(':');
                    this.emit('sysMessage', {
                        message: sysMessage
                    });
                } break;
                default: {
                    console.log('Unknown Message: ' + msg);
                }
            }
        }
    }
};

module.exports = NomadDirectServer;