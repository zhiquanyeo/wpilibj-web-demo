Analog Distance Sensor
======================

This snippet shows an example of how to use an `AnalogInput` component to read distances off a distance sensor.

### Requirements
An `AnalogInput` component named `distanceSensor` initialized with port 0

### Usage
Copy the code in the Snippet section into your TestRobot class, then see the Examples section for usage examples

### Snippet
```java
protected double getDistanceCM() {
    double voltage = distanceSensor.getVoltage();

    // Convert to number unit measure from sensor
    double voltageUnit = voltage * (5.0 / 1024);

    double distance = 13 / voltageUnit;

    return distance;
}

protected double getDistanceIN() {
    return getDistanceCM() * 0.393701;
}
```

### Examples
Here are some examples of how to use the above snippet

**Get distance in centimetres**
`double dist = getDistanceCM();`

**Get distance in inches**
`double dist = getDistanceIN();`