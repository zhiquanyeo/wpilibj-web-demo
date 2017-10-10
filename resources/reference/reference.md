This section lists some useful commands and code for use in controlling your robot.

### Robot State
The following functions can be performed on the `TestRobot` object (referred to in code as `this`):

**boolean isEnabled()**
Returns `true` if the robot is currently enabled (that is, not disabled)

**boolean isAutonomous()**
Returns `true` if the robot is currently in autonomous mode

**boolean isOperatorControl()**
Returns `true` if the robot is currently in teleop mode

### Moving your robot around
The following functions can be performed on a `RobotDrive` object:

**tankDrive(double leftSpeed, double rightSpeed, boolean squared)**
This function allows you to control each motor independently. Allowable values for `leftSpeed` and `rightSpeed` are in the range of -1.0 to 1.0. The `squared` parameter is optional and if not provided, defaults to `true`. If `squared` is set to `true`, the sensitivity is decreased at lower speeds (useful if using a joystick)

**arcadeDrive(double moveVal, double turnVal, boolean squared)**
This function allows you to control the robot in terms of forward/reverse speed, and turning speed. Allowable values for `moveVal` and `turnVal` are in the range of -1.0 to 1.0. The `squared` parameter is optional and if not provided, defaults to `true`. If `squared` is set to `true`, the sensitivity is decreased at lower speeds (useful if using a joystick)

### Utility Functions
The following are general functions that might be of use:

**Timer.delay(double seconds)**
This functions sleeps/blocks for the given number of seconds before continuing execution. Motors and outputs continue to run though! Useful for asking the robot to drive for a certain amount of time before stopping.
