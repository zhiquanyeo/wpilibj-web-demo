'use strict';

var Gpio = require('pigpio').Gpio;

// Explorer pHAT

var LED1 = 4;
var LED2 = 17;
var LED3 = 27;
var LED4 = 5;

// TODO - Pins for Input and Output

var M1B = 19; // BCM 19
var M1F = 20; // BCM 20
var M2B = 21; // BCM 21
var M2F = 26; // BCM 26

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
        
        this.d_motors.push(new Motor(M1F, M1B));
        this.d_motors.push(new Motor(M2F, M2B));
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
}

// Return a single instance of this
module.exports = new ExplorerHat();
