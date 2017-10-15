import edu.wpi.first.wpilibj.*;

public class TestRobot extends SampleRobot {

    // This declares a new RobotDrive that uses PWM outputs 0 and 1
    // The RobotDrive is used to control the motors on the robot.
    private RobotDrive drivetrain = new RobotDrive(0, 1);

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