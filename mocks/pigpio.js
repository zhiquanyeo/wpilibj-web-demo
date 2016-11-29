var pigpio = {
	Gpio: function(pin) {
		var d_pin = pin;
		var d_pwmRange = 255;
        var d_mode = 1;
        var d_val = 0;

		this.pwmRange = function (range) {
			d_pwmRange = range;
		};

		this.pwmWrite = function(val) {
			console.log('[PWM-' + d_pin + '] -> ' + val);
		};
        
        this.digitalRead = function () {
            return this.d_val;
        };
        
        this.digitalWrite = function (val) {
            console.log('[DIGITAL-' + d_pin + '] -> ' + (!!val));
        };
        
        this.enableAlert = function () {
            // no-op
        };
        
        this.on = function(evt, callback) {
            // no-op  
        };
        
        this.mode = function (mode) {
            this.d_mode = mode;
        }

		this.OUTPUT = 1;
        this.INPUT = 2;
	}
};

module.exports = pigpio;