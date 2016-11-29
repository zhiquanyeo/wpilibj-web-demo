'use strict';

var Gpio = require('pigpio').Gpio;

// Explorer pHAT

// Outputs via ULN2003A
// Outputs SINK current, so conenct +5V--->[DEVICE]--->Output
var OUT1 = 6;
var OUT2 = 12;
var OUT3 = 13;
var OUT4 = 16;

// 5V Tolerant inputs
var IN1 = 23;
var IN2 = 22;
var IN3 = 24;
var IN4 = 25;

// Motor, via DRV8833PWP Dual H-Bridge
var M1B = 19; // BCM 19
var M1F = 20; // BCM 20
var M2B = 21; // BCM 21
var M2F = 26; // BCM 26

// Class representing a Pin. Handles both input and output
class Pin {
    constructor(pin) {
        this.d_pin = pin;
        this.d_gpioPin = new Gpio(this.d_pin);
        
        this.d_last = this.read();
        this.d_onChangeHandler = null;
        this.d_onHighHandler = null;
        this.d_onLowHandler = null;
    }
    
    hasChanged() {
        if (this.read() !== this.d_last) {
            this.d_last = this.read();
            return true;
        }
        return false;
    }
    
    read() {
        return this.d_gpioPin.digitalRead();
    }
}

class Input extends Pin {
    constructor(pin) {
        super(pin);
        
        // The GPIO Pin object is ready here
        this.d_gpioPin.mode(Gpio.INPUT);
        this.d_hasCallback = false;
    }
    
    onHigh(callback) {
        this.d_onHighHandler = callback;
        this._setupcallback();
    }
    
    onLow(callback) {
        this.d_onLowHandler = callback;
        this._setupcallback();
    }
    
    onChange(callback) {
        this.d_onChangeHandler = callback;
        this._setupcallback();
    }
    
    _setupcallback() {
        if (this.d_hasCallback) {
            return;
        }
        
        this.d_gpioPin.enableAlert();
        
        // Set up events
        this.d_gpioPin.on('alert', function (level, tick) {
            if (level === 0) {
                if (this.d_onLowHandler) this.d_onLowHandler();
            }
            else {
                if (this.d_onHighHandler) this.d_onHighHandler();
            }
            
            if (this.d_onChangeHandler) this.d_onChangeHandler();
        }.bind(this));
        
        this.d_hasCallback = true;
    }
}

class Output extends Pin {
    constructor(pin) {
        super(pin);
        this.d_gpioPin.mode(Gpio.OUTPUT);
    }
    
    write(val) {
        val = !!val;
        this.d_gpioPin.digitalWrite(val ? 1 : 0);
    }
}

class Motor {
    constructor(pinF, pinB) {
        this.d_type = 'Motor';
        this.d_invert = false;
        this.d_pinForward = pinF;
        this.d_pinBackward = pinB;
        this.d_speed = 0;
     	
	this.d_pwmForward = new Gpio(this.d_pinForward, {mode: Gpio.OUTPUT});
	this.d_pwmBackward = new Gpio(this.d_pinBackward, {mode: Gpio.OUTPUT});   
    this.d_pwmForward.pwmRange(1024);
	this.d_pwmBackward.pwmRange(1024);   
    }
    
    get isInverted() {
        return this.d_invert;
    }
    
    invert () {
        this.d_invert = !this.d_invert;
        this.d_speed = -this.d_speed;
        this.setSpeed(this.d_speed);
        return this.d_invert;
    }
    
    forwards(speed) {
        if (speed === undefined) {
            speed = 100;
        }
        if (speed > 100) speed = 100;
        if (speed < 0) speed = 0;
        
        if (this.d_invert) {
            this.setSpeed(-speed);
        }
        else {
            this.setSpeed(speed);
        }
    }
    
    backwards(speed) {
        if (speed === undefined) {
            speed = 100;
        }
        if (speed > 100) speed = 100;
        if (speed < 0) speed = 0;
        
        if (this.d_invert) {
            this.setSpeed(speed);
        }
        else {
            this.setSpeed(-speed);
        }
    }
    
    setSpeed(speed) {
        if (speed === undefined) {
            speed = 100;
        }
        
        if (speed > 100) speed = 100;
        if (speed < -100) speed = -100;
        
        this.d_speed = speed;
        
        var writeVal = Math.round(Math.abs(speed) / 100.0 * 1024);
        if (speed > 0) {
            this.d_pwmBackward.pwmWrite(0);
            this.d_pwmForward.pwmWrite(writeVal);
        }
        else if (speed < 0) {
            this.d_pwmBackward.pwmWrite(writeVal);
            this.d_pwmForward.pwmWrite(0);
        }
        else {
            this.d_pwmBackward.pwmWrite(0);
            this.d_pwmForward.pwmWrite(0);
        }
        
        return speed;
    }
    
    stop() {
        this.setSpeed(0);
    }   
}

class ExplorerHat {
    constructor() {
        this.d_motors = [];
        this.d_inputs = [];
        this.d_outputs = [];
        
        this.d_motors.push(new Motor(M1F, M1B));
        this.d_motors.push(new Motor(M2F, M2B));
        
        this.d_inputs.push(new Input(IN1));
        this.d_inputs.push(new Input(IN2));
        this.d_inputs.push(new Input(IN3));
        this.d_inputs.push(new Input(IN4));
        
        this.d_outputs.push(new Output(OUT1));
        this.d_outputs.push(new Output(OUT2));
        this.d_outputs.push(new Output(OUT3));
        this.d_outputs.push(new Output(OUT4));
    }
    
    setMotorSpeed(channel, speed) {
        if (channel < 0 || channel >= this.d_motors.length) {
            return;
        }
        this.d_motors[channel].setSpeed(speed);
    }
    
    setMotorInvert(channel, invert) {
        if (channel < 0 || channel >= this.d_motors.length) {
            return;
        }
        
        var motor = this.d_motors[channel];
        if (!!invert !== motor.isInverted) {
            motor.invert();
        }
    }
    
    digitalRead(channel) {
        if (channel < 0 || channel >= this.d_inputs.length) {
            throw new Error('Invalid channel number: '+ channel);
        }
        
        return this.d_inputs[channel].read();
    }
    
    setOnChangeHandler(channel, callback) {
        if (channel < 0 || channel >= this.d_inputs.length) {
            throw new Error('Invalid channel number: '+ channel);
        }
        
        this.d_inputs[channel].onChange(callback);
    }
    
    setOnLowHandler(channel, callback) {
        if (channel < 0 || channel >= this.d_inputs.length) {
            throw new Error('Invalid channel number: '+ channel);
        }
        
        this.d_inputs[channel].onLow(callback);
    }
    
    setOnHighHandler(channel, callback) {
        if (channel < 0 || channel >= this.d_inputs.length) {
            throw new Error('Invalid channel number: '+ channel);
        }
        
        this.d_inputs[channel].onHigh(callback);
    }
    
    digitalWrite(channel, val) {
        if (channel < 0 || channel >= this.d_outputs.length) {
            throw new Error('Invalid channel number: '+ channel);
        }
        
        this.d_outputs[channel].write(val);
    }
}

// Return a single instance of this
module.exports = new ExplorerHat();
