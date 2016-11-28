'use strict';

const EventEmitter = require('events');
var fs = require('fs');
var spawn = require('child_process').spawn;

var WORKSPACE_DIR = __dirname + '/workspaces';

class AppManager extends EventEmitter {
    constructor() {
        super();
        this.d_appRunning = false;
        this.d_app = null;
    }

    get appRunning() {
        return this.d_appRunning;
    }

    stopApp() {
        // TODO Send SIGINT to this.d_app
    }

    compileAndRun(sourceCode, clientId, socket) {
        if (this.d_appRunning) {
            socket.emit('outputMessage', {
                message: 'Application already running',
                isError: true
            });
            return;
        }

        var clientWorkspaceDir = WORKSPACE_DIR + '/' + clientId
        if (!fs.existsSync(clientWorkspaceDir)) {
            fs.mkdirSync(clientWorkspaceDir);
        }
        fs.writeFileSync(clientWorkspaceDir + '/TestRobot.java', sourceCode);

        var compileTask = spawn('javac', [clientWorkspaceDir + '/TestRobot.java'], {
            cwd: clientWorkspaceDir
        });

        compileTask.on('error', function (err) {
            console.log('Failed to start javac');
            socket.emit('outputMessage', {
                message: err.toString(),
                isError: true
            });

            socket.emit('buildFailed');
        });

        compileTask.on('close', function (data) {
            if (data !== 0) {
                console.log('There was an error while running javac');
                socket.emit('outputMessage', {
                    message: 'There was an error compiling the file',
                    isError: true
                });
                
                socket.emit('compileComplete', {
                    success: false
                });
                socket.emit('buildFailed');
            }
            else {
                console.log('Compilation successful');
                socket.emit('outputMessage', {
                    message: 'Compilation Successful!',
                });

                socket.emit('compileComplete', {
                    success: true
                });

                // Now start running
                this.d_app = spawn('java', ['-jar', 'nomad-wpilibj-lite.jar', 'RobotBase'], {
                    cwd: clientWorkspaceDir
                });

                this.d_appRunning = true;

                this.d_app.on('error', function (err) {
                    console.error('Failed to start app');
                    socket.emit('outputMessage', {
                        message: err.toString(),
                        isError: true
                    });
                    this.d_appRunning = false;
                }.bind(this));

                this.d_app.on('close', function (data) {
                    if (data !== 0) {
                        socket.emit('outputMessage', {
                            message: 'Application stopped with non-zero return code',
                            isError: true
                        });

                        socket.emit('consoleMessage', {
                            message: 'Application stopped with non-zero return code',
                            isError: true
                        });
                    }
                    else {
                        socket.emit('outputMessage', {
                            message: 'Application stopped',
                        });

                        socket.emit('consoleMessage', {
                            message: 'Application stopped',
                        });
                    }

                    this.d_appRunning = false;
                }.bind(this));

                // Hook up the IO streams
                this.d_app.stdout.on('data', function (data) {
                    socket.emit('consoleMessage', {
                        message: data.toString()
                    });
                }.bind(this));

                this.d_app.stderr.on('data', function (data) {
                    socket.emit('consoleMessage', {
                        message: data.toString(),
                        isError: true
                    });
                }.bind(this));
            }
        }.bind(this));

        compileTask.stdout.on('data', function (data) {
            console.log('STDOUT: ', data.toString());
            socket.emit('outputMessage', {
                message: data.toString()
            });
            
        });

        compileTask.stderr.on('data', function (data) {
            socket.emit('outputMessage', {
                message: data.toString(),
                isError: true
            });
            
        });
    }
}

module.exports = AppManager;