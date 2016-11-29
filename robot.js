'use strict';

const EventEmitter = require('events');
const ExplorerHAT = require('./explorer-hat.js');

class Robot extends EventEmitter {
    constructor() {
        super();
        
        // TODO Also hook into the digital input pins from the 
        // ExplorerHAT
    }
    
    setPWM(channel, val) {
        // Input value is 0-255, need to convert to -100 to 100
        var pwmVal = Math.round((val / 255) * 200) - 100
        ExplorerHAT.setMotorSpeed(channel, pwmVal);
    }
    
    setDigital(channel, val) {
        // TODO Implement
    }
}

module.exports = Robot;