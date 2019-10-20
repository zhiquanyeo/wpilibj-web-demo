import edu.wpi.first.wpilibj.*;

public class TestRobot extends TimedRobot {

    // This declares a new RobotDrive that uses PWM outputs 0 and 1
    // The RobotDrive is used to control the motors on the robot.
    private RobotDrive drivetrain = new RobotDrive(0, 1);

    // This function gets called once when the robot wakes up
    public void robotInit() {
        // Here, we print a welcome message
        System.out.println("Hello! I am TestRobot");

        // TODO Try driving forward (negative speed), and see which way the wheels
        // turn. if the left wheel is turning backwards, uncomment the line with
        // 'kRearLeft'. If the right wheel is turning backwards, uncomment the line
        // with 'kRearRight'. If BOTH wheels are turning backwards, uncomment both
        // lines.
        //
        // NOTE: You can also switch the wires around in lieu of uncommenting the
        // respective code lines

        // drivetrain.setInvertedMotor(RobotDrive.MotorType.kRearLeft, true);
        // drivetrain.setInvertedMotor(RobotDrive.MotorType.kRearRight, true);
    }

    // The code in this section will run whenever the robot first transitions
    // to the autonomous mode
    public void autonomousInit() {

    }

    // The code in this section will run periodically when the robot is in autonomous mode
    public void autonomousPeriodic() {

    }

    // The code in this section will run whenever the robot first transitions
    // to the teleop mode
    public void teleopInit() {

    }

    // The code in this section will run periodically when the robot is in teleop mode
    public void teleopPeriodic() {

    }

    // The code in this section will run whenever the robot first transitions
    // to the disabled mode
    public void disabledInit() {

    }
}