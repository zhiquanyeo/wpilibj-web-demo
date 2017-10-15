(function() {
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var marked = require('marked');
var Moniker = require('moniker');

var NomadServer = require('./nomad-direct-server.js');
var UserManager = require('./user-manager.js');

const RobotConfigManager = require('./configurations/robot-config');

const { Constants, Robot } = require('@ftl-robots/ftl-robot-host');
const Path = require('path');
const OS = require('os');
const commandLineArgs = require('command-line-args');

marked.setOptions({
	breaks: true
});

const DEFAULT_WORKSPACE_DIR = OS.tmpdir() + Path.sep + '/ftl-workspaces';

var TEMPLATES_DIR = __dirname + '/resources/templates';
var PUBLIC_HTML_DIR = __dirname + '/public_html';
var PUBLIC_JS_DIR = PUBLIC_HTML_DIR + '/js';

// Templates, documentation, etc
var REFERENCE_DIR = __dirname + '/resources/reference';
var SNIPPETS_DIR = __dirname + '/resources/snippets';

// Set up command line args
const optionDefs = [
	{ name: 'config', alias: 'c', type: String},
	{ name: 'workspace', alias: 'w', type: String }
];

const opts = commandLineArgs(optionDefs, { partial: true });

const cfgConfig = opts.config !== undefined ? opts.config : 'normal';
const cfgWorkspaceDir = opts.workspace !== undefined ? opts.workspace : DEFAULT_WORKSPACE_DIR;

var clientList = [];
var clientMap = {};

// Initialize workspaces
if (!fs.existsSync(cfgWorkspaceDir)) {
	console.log('Creating workspace directory');
	fs.mkdirSync(cfgWorkspaceDir);
}
console.log('Using workspace directory: ', cfgWorkspaceDir);

// === GENERATE DOCUMENTATION ===
// reference docs
var refDoc = fs.readFileSync(REFERENCE_DIR + '/reference.md', { encoding: 'utf-8' });
var refDocHTML = marked(refDoc);

// snippets
var snippetFiles = fs.readdirSync(SNIPPETS_DIR);
var snippetFileData = [];
for (var i = 0; i < snippetFiles.length; i++) {
	var snippetContents = fs.readFileSync(SNIPPETS_DIR + Path.sep + snippetFiles[i], { encoding: 'utf-8' });
	snippetFileData.push({
		name: snippetFiles[i],
		data: marked(snippetContents)
	});
}

// templates
var templateFiles = fs.readdirSync(TEMPLATES_DIR);
var templateFileData = [];
for (var i = 0; i < templateFiles.length; i++) {
	var fileContents = fs.readFileSync(TEMPLATES_DIR + '/' + templateFiles[i], { encoding: 'utf-8' });
	templateFileData.push({
		filename: templateFiles[i],
		data: fileContents
	});
}

var REFERENCE_DATA = {
	referenceDoc: refDocHTML,
	snippets: snippetFileData,
	templates: templateFileData
};

// === END DOCUMENTATION GENERATION ===


// Now we should be ready to start
// Initialize the robot hardware
var robotConfig = RobotConfigManager.getConfig(cfgConfig);
var robot = new Robot(robotConfig);

// Start up the listening server
var server = new NomadServer(6969);

// Set up the UserManager
var userManager = new UserManager(server, cfgWorkspaceDir);

// Robot "I/O"
// events from 'server' represent commands from the robot program
// events from 'robot' represent data/sensor readings from the physical robot
server.on('digitalOutput', function (data) {
	robot.writeDigital(data.channel, data.value);
});

server.on('pwmOutput', function (data) {
	// Value is 0-255
	robot.writePWM(data.channel, data.value);
});

server.on('enableRobot', function () {
	robot.enable();
})

server.on('disableRobot', function () {
	console.log('Robot Disabled');
	robot.disable();
})

app.use(express.static('public_html'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public_html/index.html');
});

io.on('connection', function (socket) {
	var clientId = Moniker.choose();
	userManager.registerUser(clientId, socket);

	// Send out the reference data packet
	socket.emit('referenceData', REFERENCE_DATA);
});

http.listen(3000, function () {
	console.log('WebApp server listening on *:3000');
});

})();