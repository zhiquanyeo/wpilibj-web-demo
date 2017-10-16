Digital Contact Sensor
======================

This snippet shows an example of how to use a `DigitalInput` component to see if we are touching something. The idea is that we mount a switch near the front of the robot, and if it hits a wall, the switch is closed, and will read `true`.

### Requirements
A `DigitalInput` component named `contactSensor` initialized with port 0

### Usage
See the Examples

### Examples

**See if the switch is pressed**
`boolean isTouching = contactSensor.get();`