var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var NomadServer = require('./nomad-direct-server.js');
var UserManager = require('./user-manager.js');
var spawn = require('child_process').spawn;

var WORKSPACE_DIR = __dirname + '/workspaces';
var TEMPLATES_DIR = __dirname + '/resources/templates';
var PUBLIC_HTML_DIR = __dirname + '/public_html';
var PUBLIC_JS_DIR = PUBLIC_HTML_DIR + '/js';

// === Utility Functions ===
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

var clientList = [];
var clientMap = {};

// Initialize workspaces
if (!fs.existsSync(WORKSPACE_DIR)) {
	fs.mkdirSync(WORKSPACE_DIR);
}

// Generate the templates file if we need to
var templateFiles = fs.readdirSync(TEMPLATES_DIR);
var templateFileData = [];
for (var i = 0; i < templateFiles.length; i++) {
	var fileContents = fs.readFileSync(TEMPLATES_DIR + '/' + templateFiles[i], { encoding: 'utf-8' });
	templateFileData.push({
		filename: templateFiles[i],
		data: fileContents
	});
}
var templateString = 'var FILE_TEMPLATES = ' + JSON.stringify(templateFileData, null, 4);
fs.writeFileSync(PUBLIC_JS_DIR + '/templates.js', templateString);

// Now we should be ready to start
// Start up the listening server
var server = new NomadServer(6969);

// Set up the UserManager
var userManager = new UserManager();

server.on('digitalOutput', function (data) {
    console.log('DigitalOutput: ', data);
})

app.use(express.static('public_html'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public_html/index.html');
});

io.on('connection', function (socket) {
	var clientId = generateUUID();

	var eventHandlers = {
		'compile': function (clientId, socket, msg) {
			doCompile(msg, clientId, socket)
		},
		'mode': function (clientId, socket, mode) {
			server.setRobotMode(mode)
		}
	};

	userManager.registerUser(clientId, socket, eventHandlers);
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

function doCompile(text, clientId, socket) {
	var clientWorkspaceDir = WORKSPACE_DIR + '/' + clientId
	if (!fs.existsSync(clientWorkspaceDir)) {
		fs.mkdirSync(clientWorkspaceDir);
	}
	fs.writeFileSync(clientWorkspaceDir + '/TestRobot.java', text);

	var task = spawn('javac', [clientWorkspaceDir + '/TestRobot.java'], {
		cwd: clientWorkspaceDir
	});

	task.on('error', function (err) {
		console.log('Failed to start javac');
		if (socket) {
			socket.emit('outputMessage', {
				message: err.toString(),
				isError: true
			});
		}
	});

	task.on('close', function (data) {
		var success = true;
		if (data !== 0) {
			console.log('There was an error while running javac');
			if (socket) {
				socket.emit('outputMessage', {
					message: 'There was an error compiling the file',
					isError: true
				});
			}
			success = false;
		}
		else {
			console.log('Compilation successful');
			if (socket) {
				socket.emit('outputMessage', {
					message: 'Compilation Successful!',
				});
			}

			// TODO Also emit compile success flag to indicate to app that we are good to go
		}

		if (socket) {
			socket.emit('compileComplete', {
				success: success
			});
		}
	});

	task.stdout.on('data', function (data) {
		console.log('STDOUT: ', data.toString());
		if (socket) {
			socket.emit('outputMessage', {
				message: data.toString()
			});
		}
	});

	task.stderr.on('data', function (data) {
		console.log('STDERR: ', data.toString());
		if (socket) {
			socket.emit('outputMessage', {
				message: data.toString(),
				isError: true
			});
		}
	})
}