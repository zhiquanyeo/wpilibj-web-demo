Teleop Drive
============

This snippet shows an example of how to use a `Joystick` component and a `RobotDrive` component to drive a robot around using the control sticks on a gamepad. The left analog stick controls how fast the robot moves forward or backward, and the right analog stick controls how fast the robot turns.

### Requirements
A `RobotDrive` component named `drivetrain`
A `Joystick` component named `gamepad`

### Usage
Copy the code in the Snippet section into your TestRobot class, then see the Examples section for usage examples.

### Snippet
```java
protected void teleopDrive(Joystick gamepad) {
    // We grab the values from the joystick axes and use them as inputs
    // to the arcadeDrive method
    double moveVal = gamepad.getRawAxis(1); // Left stick, y-axis
    double turnVal = gamepad.getRawAxis(2); // right stick, x-axis

    // If the robot turns the wrong way, uncomment the line below
    //turnVal = -turnVal;

    drivetrain.arcadeDrive(moveVal, turnVal);
}
```

### Examples
Copy the line below into the `operatorControl()` method of your `TestRobot` class. This will then get called multiple times a second when in teleop mode, and allow you to steer the robot using the gamepad.

```java
teleopDrive(this.gamepad);
```