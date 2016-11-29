var pigpio = {
	Gpio: function(pin) {
		var d_pin = pin;
		var d_pwmRange = 255;

		this.pwmRange = function (range) {
			d_pwmRange = range;
		}

		this.pwmWrite = function(val) {
			console.log('[PWM-' + d_pin + '] -> ' + val);
		}

		this.OUTPUT = 1;

	}
};

module.exports = pigpio;