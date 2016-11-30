import edu.wpi.first.wpilibj.*;

public class TestRobot extends SampleRobot {

    // This declares a new RobotDrive that uses PWM outputs 0 and 1
    // The RobotDrive is used to control the motors on the robot.
    private RobotDrive drivetrain = new RobotDrive(0, 1);

    // This function gets called once when the robot wakes up
    protected void robotInit() {
        // Here, we print a welcome message
        System.out.println("Hello! I am TestRobot");
    }

    // TThe code in this function gets run when the robot enters autonomous mode
    protected void autonomous() {

    }

    // The code in this function gets run when the robot enters teleop mode
    protected void operatorControl() {

    }

    // The code in this function gets run when the robot is disabled
    protected void disabled() {
        // In this case, we print a message
        System.out.println("Aww... I've been disabled");
    }
}