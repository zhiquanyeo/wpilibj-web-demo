Drive For Time
==============

This snippet shows an example of how to use a `RobotDrive` component and the periodic methods to drive for a set amount of time. This takes the form of several methods that can be copied into your TestRobot class and called from other parts of your code.

### Requirements
A `RobotDrive` component named `drivetrain`
A `long` variable named `startTime`, initialized to 0
A `long` variable named `driveTime`, initialized to 0
A `double` variable named `moveValue`, initialized to 0
A `double` variable named `turnvalue`, initialized to 0
A `boolean` variable named `shouldDriveForTime`, initialized to `false`

### Usage
Copy the code in the Snippet section into your TestRobot class, then see the Examples section for usage examples

### Snippet
```java
protected void setupDriveForTime(double move, double turn, double runTimeInSeconds) {
    // moveVal and turnVal take values from -1.0 to 1.0
    // By convention, negative values of moveVal make the robot move forward
    // but if your robot goes backwards, try switching the sign!

    // All this function really does is to set the appropriate variables, and return
    this.moveValue = move;
    this.turnValue = turn;
    this.shouldDriveForTime = true;
    this.startTime = System.currentTimeMillis();

    // We take in the time in SECONDS, but we want to operate in MILLISECONDS
    this.driveTime = (long)(runTimeInSeconds * 1000);
}

protected void driveForTime() {
    // All this function does is to apply the appropriate values to the drivetrain
    // depending on how much time has elapsed
    if (this.shouldDriveForTime) {
        // We are in the correct mode (shouldDriveForTime)
        if (System.currentTimeMillis() - this.startTime > this.driveTime) {
            // The time has expired, we should stop the motors
            this.moveValue = 0.0;
            this.turnValue = 0.0;
            this.shouldDriveForTime = false;
            this.startTime = 0;
            this.driveTime = 0;
        }
    }
    else {
        this.moveValue = 0.0;
        this.turnValue = 0.0;
    }

    // All the code above did was determine what speeds to run the motors at
    // depending on how much time has elapsed. What we need to do next is to
    // apply the speeds to the drivetrain
    this.drivetrain.arcadeDrive(this.moveValue, this.turnValue);
}
```

### Examples
Here are some examples of how to use the above snippet

All of the examples involve replacing the `autonomousInit()` and `autonomousPeriodic()` functions.

**Drive straight for 5 seconds at 50% power**
```java
public void autonomousInit() {
    setupDriveForTime(0.5, 0.0, 5.0);
}

public void autonomousPeriodic() {
    driveForTime();
}
```

**Drive at a curve for 5 seconds at 50% power and a 25% turn rate**
```java
public void autonomousInit() {
    setupDriveForTime(0.5, 0.25, 5.0);
}

public void autonomousPeriodic() {
    driveForTime();
}
```