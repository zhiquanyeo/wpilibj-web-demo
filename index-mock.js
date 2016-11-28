// Set up mocks so that this works on a regular computer
'use strict'

const mockery = require('mockery');

mockery.registerSubstitute('raspi', './mocks/raspi');
mockery.registerSubstitute('raspi-pwm', './mocks/raspi-pwm');
mockery.enable({
    warnOnUnregistered: false
});

console.log('=== STARTING MOCKED APPLICATION ===');
require('./index.js');