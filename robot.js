'use strict';

const EventEmitter = require('events');
const ExplorerHAT = require('./explorer-hat.js');

class Robot extends EventEmitter {
    constructor() {
        super();
    }
    
    setPWM(channel, val) {
        // TODO Adjust the value accordingly
        ExplorerHAT.setMotorSpeed(channel, val);
    }
}

module.exports = Robot;