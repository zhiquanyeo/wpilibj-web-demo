'use strict';

const EventEmitter = require('events');
var fs = require('fs');
var spawn = require('child_process').spawn;

var WORKSPACE_DIR = __dirname + '/workspaces';
var RESOURCES_DIR = __dirname + '/resources';

class AppManager extends EventEmitter {
    constructor() {
        super();
        this.d_appRunning = false;
        this.d_app = null;
    }

    get appRunning() {
        return this.d_appRunning;
    }
    
    /**
     * Clean up workspace folders for unused clients
     */
    cleanup(clientId) {
        if (!clientId) {
            return;
        }
        
        var clientWorkspaceDir = WORKSPACE_DIR + '/' + clientId;
        try {
            if (fs.existsSync(clientWorkspaceDir)) {
                // Delete all files in this
                fs.readdirSync(clientWorkspaceDir).forEach(function (file, index) {
                    var curPath = clientWorkspaceDir + '/' + file;
                    fs.unlinkSync(curPath); 
                });
                
                fs.rmdirSync(clientWorkspaceDir);
            }
        }
        catch (err) {
            setTimeout(function () {
                this.cleanup(clientId);
            }.bind(this), 1000);
        }
        // Otherwise, do nothing
    }

    stopApp() {
        if (this.d_app) {
            this.d_app.kill();
        }
        this.d_appRunning = false;
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
            
            // Also copy the jar file
            try {
                fs.linkSync(RESOURCES_DIR + '/nomad-wpilibj-lite.jar', 
                            clientWorkspaceDir + '/nomad-wpilibj-lite.jar');
            }
            catch (err) {
                console.error('Error copying JAR: ', err.toString());
            }
        }
        fs.writeFileSync(clientWorkspaceDir + '/TestRobot.java', sourceCode);
        
        socket.emit('compileStarted');
        
        var compileTask = spawn('javac', ['-classpath', 'nomad-wpilibj-lite.jar',  
                                          clientWorkspaceDir + '/TestRobot.java'], {
            cwd: clientWorkspaceDir
        });

        compileTask.on('error', function (err) {
            console.log('Failed to start javac');
            socket.emit('outputMessage', {
                message: err.toString(),
                isError: true
            });
            
            socket.emit('compileComplete', {
                success: false
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
                var cpString;
                if (process.platform === 'win32') {
                    cpString = './nomad-wpilibj-lite.jar;./*';
                }
                else {
                    cpString = './nomad-wpilibj-lite.jar:./*';
                }

                this.d_app = spawn('java', ['-cp', cpString, 
                                            'edu.wpi.first.wpilibj.RobotRunner',
                                            '-m', 'direct',
                                            '-h', 'tcp://localhost:6969',
                                            'TestRobot'], {
                    cwd: clientWorkspaceDir
                });

                this.d_appRunning = true;
                socket.emit('appStarted');

                this.d_app.on('error', function (err) {
                    console.error('Failed to start app');
                    socket.emit('outputMessage', {
                        message: err.toString(),
                        isError: true
                    });
                    this.d_appRunning = false;
                    socket.emit('appStopped');
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
                    
                    socket.emit('appStopped');
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