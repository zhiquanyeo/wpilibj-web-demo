module.exports = {
    PWM: function (pin) {
        var d_pin = pin;
        
        this.write = function(val) {
            console.log('[PWM-' + d_pin + '] -> ' + val);
        }
    }
}