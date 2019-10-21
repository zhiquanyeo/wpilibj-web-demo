This section lists some useful commands and code for use in controlling your robot.

### Robot State
The following functions can be performed on the `TestRobot` object (referred to in code as `this`):

**boolean isEnabled()**
Returns `true` if the robot is currently enabled (that is, not disabled)

**boolean isAutonomous()**
Returns `true` if the robot is currently in autonomous mode

**boolean isOperatorControl()**
Returns `true` if the robot is currently in teleop mode

### Periodic Functions
The robot operates in a few different states (autonomous, teleop, disabled) and for each of these, there are two methods that get called.

**[disabled/teleop/autonomous]Init()**
This function gets called whenever the robot transitions into that specific mode. E.g. If the robot was disabled and is now in autonomous mode, the `autonomousInit()` method gets called. Any code in these functions will get called when the robot transitions into that state.

**[disabled/teleop/autonomous]Periodic()**
This function gets called periodically (hence the name) when the robot is in a specific mode. E.g. if the robot is in autonomous mode, the `autonomousPeriodic()` method gets called every 20ms. Put code in here that affects robot behavior while it is in that mode. NOTE: It is highly recommended to NOT use `Timer.delay()` in these methods!

### Using the Joystick
Joysticks can be instantiated using the `Joystick` class, and should be initialized with a port number, in most cases, `0`.

e.g. `Joystick stick = new Joystick(0);`

The `getRawAxis(int axis)` method is used to get the value of one of the joystick's axes, and returns a value between -1.0 and 1.0. For the Logitech gamepad, the stick axes are:

- 0: Left Stick, X axis
- 1: Left Stick, Y axis
- 2: Right Stick, X axis
- 3: Right Stick, Y axis

### Moving your robot around
The following functions can be performed on a `RobotDrive` object:

**tankDrive(double leftSpeed, double rightSpeed, boolean squared)**
This function allows you to control each motor independently. Allowable values for `leftSpeed` and `rightSpeed` are in the range of -1.0 to 1.0. The `squared` parameter is optional and if not provided, defaults to `true`. If `squared` is set to `true`, the sensitivity is decreased at lower speeds (useful if using a joystick)

**arcadeDrive(double moveVal, double turnVal, boolean squared)**
This function allows you to control the robot in terms of forward/reverse speed, and turning speed. Allowable values for `moveVal` and `turnVal` are in the range of -1.0 to 1.0. The `squared` parameter is optional and if not provided, defaults to `true`. If `squared` is set to `true`, the sensitivity is decreased at lower speeds (useful if using a joystick)

### Utility Functions
The following are general functions that might be of use:

**long System.currentTimeMillis()**
This built-in method gets the current timestamp in milliseconds. Useful for checking how long it's been since an event happened.

**Timer.delay(double seconds)**
This functions sleeps/blocks for the given number of seconds before continuing execution. Motors and outputs continue to run though! Useful for asking the robot to drive for a certain amount of time before stopping.
