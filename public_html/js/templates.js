var FILE_TEMPLATES = [
    {
        "filename": "TestRobot.java",
        "data": "import edu.wpi.first.wpilibj.*;\r\n\r\npublic class TestRobot extends SampleRobot {\r\n\r\n    // This declares a new RobotDrive that uses PWM outputs 0 and 1\r\n    // The RobotDrive is used to control the motors on the robot.\r\n    private RobotDrive drivetrain = new RobotDrive(0, 1);\r\n\r\n    // This function gets called once when the robot wakes up\r\n    protected void robotInit() {\r\n        // Here, we print a welcome message\r\n        System.out.println(\"Hello! I am TestRobot\");\r\n    }\r\n\r\n    // TThe code in this function gets run when the robot enters autonomous mode\r\n    protected void autonomous() {\r\n\r\n    }\r\n\r\n    // The code in this function gets run when the robot enters teleop mode\r\n    protected void operatorControl() {\r\n\r\n    }\r\n\r\n    // The code in this function gets run when the robot is disabled\r\n    protected void disabled() {\r\n        // In this case, we print a message\r\n        System.out.println(\"Aww... I've been disabled\");\r\n    }\r\n}"
    }
]