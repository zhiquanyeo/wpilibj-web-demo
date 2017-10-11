Drive For Time
==============

This snippet shows an example of how to use a `RobotDrive` component and `Timer` to drive for a set amount of time. This takes the form of several methods that can be copied into your TestRobot class and called from other parts of your code.

### Requirements
A `RobotDrive` component named `drivetrain`

### Usage
Copy the code in the Snippet section into your TestRobot class, then see the Examples section for usage examples

### Snippet
```java
protected void driveForTime(double moveVal, double turnVal, double runTimeInSeconds) {
    // moveVal and turnVal take values from -1.0 to 1.0
    // By convention, negative values of moveVal make the robot move forward
    // but if your robot goes backwards, try switching the sign!
    
    // Turn off the drivetrain safety watchdog
    // We need to do this, otherwise, the system will go too long without motor
    // commands and shut itself off
    drivetrain.setSafetyEnabled(false);
    
    // Start the robot moving
    // We use the arcadeDrive function here
    drivetrain.arcadeDrive(moveVal, turnVal);
    
    // Do nothing for however long we want
    Timer.delay(runTimeInSeconds);
    
    // Stop all movement
    drivetrain.arcadeDrive(0.0, 0.0);
}
```

### Examples
Here are some examples of how to use the above snippet

**Drive forward for 2 seconds, at 50% speed**
`driveForTime(-0.5, 0.0, 2.0);`

**Drive forward while turning slightly right for 2 seconds**
`driveForTime(-0.5, -0.5, 2.0);`

These can also be strung together to make some interesting movement. For example, driving straight, turning right and then driving straight again
```java
driveForTime(-0.5, 0.0, 5.0);
driveForTime(0.0, -0.5, 2.0);
driveForTime(-0.5, 0.0, 5.0);
```