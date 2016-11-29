'use strict';

var raspi = require('raspi');
var PWM = require('raspi-pwm').PWM;

// Explorer pHAT

var LED1 = 4;
var LED2 = 17;
var LED3 = 27;
var LED4 = 5;

// TODO - Pins for Input and Output

var M1B = 24; // BCM 19
var M1F = 28; // BCM 20
var M2B = 29; // BCM 21
var M2F = 25; // BCM 26

class Motor {
    constructor(pinF, pinB) {
        this.d_type = 'Motor';
        this.d_invert = false;
        this.d_pinForward = pinF;
        this.d_pinBackward = pinB;
        this.d_speed = 0;
        
        this.d_pwmForward = new PWM(this.d_pinForward);
        this.d_pwmBackward = new PWM(this.d_pinBackward);
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
            this.d_pwmBackward.write(0);
            this.d_pwmForward.write(writeVal);
        }
        else if (speed < 0) {
            this.d_pwmBackward.write(writeVal);
            this.d_pwmForward.write(0);
        }
        else {
            this.d_pwmBackward.write(0);
            this.d_pwmForward.write(0);
        }
        
        return speed;
    }
    
    stop() {
        this.setSpeed(0);
    }   
}

class ExplorerHat {
    constructor() {
        this.d_ready = false;
        this.d_motors = [];
        
        raspi.init(function () {
            this.d_ready = true;
            this.d_motors.push(new Motor(M1F, M1B));
            this.d_motors.push(new Motor(M2F, M2B));
        }.bind(this));
    }
    
    setMotorSpeed(channel, speed) {
        if (!this.d_ready) {
            // TODO Potentially queue this
            return;
        }
        
        if (channel < 0 || channel >= this.d_motors.length) {
            return;
        }
        this.d_motors[channel].setSpeed(speed);
    }
    
    setMotorInvert(channel, invert) {
        if (!this.d_ready) {
            // TODO Potentially queue this
            return;
        }
        
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
