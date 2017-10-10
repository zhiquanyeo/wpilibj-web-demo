(function() {
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var markdown = require('markdown').markdown;

var NomadServer = require('./nomad-direct-server.js');
var UserManager = require('./user-manager.js');
var spawn = require('child_process').spawn;
var Robot = require('./robot.js');


var WORKSPACE_DIR = __dirname + '/workspaces';
var TEMPLATES_DIR = __dirname + '/resources/templates';
var PUBLIC_HTML_DIR = __dirname + '/public_html';
var PUBLIC_JS_DIR = PUBLIC_HTML_DIR + '/js';

// Templates, documentation, etc
var REFERENCE_DIR = __dirname + '/resources/reference';
var refDoc = fs.readFileSync(REFERENCE_DIR + '/reference.md', { encoding: 'utf-8' });
var refDocHTML = markdown.toHTML(refDoc);

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
// Initialize the robot hardware
var robot = new Robot();

// Start up the listening server
var server = new NomadServer(6969);

// Set up the UserManager
var userManager = new UserManager(server);

// Robot "I/O"
// events from 'server' represent commands from the robot program
// events from 'robot' represent data/sensor readings from the physical robot
server.on('digitalOutput', function (data) {
    robot.setDigital(data.channel, data.value);
});

server.on('pwmOutput', function (data) {
    // Value is 0-255
    robot.setPWM(data.channel, data.value);
});

server.on('disableRobot', function () {
	console.log('Robot Disabled');
	robot.disable();
})

app.use(express.static('public_html'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public_html/index.html');
});

io.on('connection', function (socket) {
	var clientId = generateUUID();
	userManager.registerUser(clientId, socket);

	socket.emit('referenceData', {
		refDoc: refDocHTML
	});
});

http.listen(3000, function () {
	console.log('WebApp server listening on *:3000');
});

})();