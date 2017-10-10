window.addEventListener('load', function () {

// HTML Elements
var layoutEditorSection = document.getElementById('editor_section');
var outputSection = document.getElementById('side-output');
var consoleSection = document.getElementById('side-console');
var compileButton = document.getElementById('compile-button');
var stopButton = document.getElementById('stop-button');
var relinquishButton = document.getElementById('relinquish-position-button');
var clearOutputButton = document.getElementById('clear-output-btn');
var outputSection = document.getElementById('output-scroll');
var clearConsoleButton = document.getElementById('clear-console-btn');
var consoleSection = document.getElementById('console-scroll');

var disableButton = document.getElementById('mode-disable');
var autoButton = document.getElementById('mode-auto');
var teleopButton = document.getElementById('mode-teleop');
var modeLabel = document.getElementById('robot-mode');

var outputTab = document.getElementById('output-tab');
var consoleTab = document.getElementById('console-tab');

var clientIdentLabel = document.getElementById('client_ident');
var connectStatusLabel = document.getElementById('connect_status');

var loadingImage = document.getElementById('loading-icon');

var referenceSection = document.getElementById('side-reference');

// All Application Logic Here
var clientId;
var socket = io();

var isActive = false;

// Disable all buttons first
compileButton.disabled = true;
stopButton.disabled = true;
disableButton.disabled = true;
autoButton.disabled = true;
teleopButton.disabled = true;
relinquishButton.disabled = true;

// Helper Functions
function postOutputMessage(text, isError) {
	var newItem = document.createElement('div');
	newItem.classList.add('output-item');
	if (isError) {
		newItem.classList.add('error');
	}
	// TODO Append Timestamp
	newItem.innerText = text.trim();

	outputSection.appendChild(newItem);
}

function clearOutput() {
	outputSection.innerHTML = '';
}

function postConsoleMessage(text, isError) {
	var newItem = document.createElement('div');
	newItem.classList.add('output-item');
	if (isError) {
		newItem.classList.add('error');
	}
	// TODO Append Timestamp
	newItem.innerText = text.trim();

	consoleSection.appendChild(newItem);
}

function clearConsole() {
	consoleSection.innerHTML = '';
}

// Hookup the socket events
socket.on('registration', function (data) {
    clientId = data;
    clientIdentLabel.innerText = 'ClientID: ' + clientId;
});

socket.on('referenceData', function (data) {
    referenceSection.innerHTML = data.refDoc;
});

socket.on('outputMessage', function (msgData) {
	if (!msgData || !msgData.message) {
		return;
	}

	postOutputMessage(msgData.message, msgData.isError);
});

socket.on('consoleMessage', function (msgData) {
	if (!msgData || !msgData.message) {
		return;
	}

	postConsoleMessage(msgData.message, msgData.isError);
});

socket.on('compileStarted', function () {
    loadingImage.classList.add('visible'); 
});

socket.on('compileComplete', function () {
    loadingImage.classList.remove('visible');
})

socket.on('active', function () {
    isActive = true;
    compileButton.disabled = false;
    relinquishButton.disabled = false;
    connectStatusLabel.innerText = 'Connected';
    connectStatusLabel.classList.add('connected');
    connectStatusLabel.classList.remove('disconnected');
});

socket.on('inactive', function (data) {
    compileButton.disabled = true;
    stopButton.disabled = true;
    disableButton.disabled = true;
    autoButton.disabled = true;
    teleopButton.disabled = true;
    relinquishButton.disabled = true;
    connectStatusLabel.classList.remove('connected');
    connectStatusLabel.classList.remove('disconnected');
    connectStatusLabel.innerText = '#' + data.position + ' in line';
});

socket.on('buildFailed', function () {
    // re-enable the compile button
    compileButton.disabled = false;
    stopButton.disabled = true;
});

socket.on('compileComplete', function (data) {
    compileButton.disabled = false;
    stopButton.disabled = true;
});

socket.on('appStarted', function () {
    stopButton.disabled = false;
    disableButton.disabled = false;
    autoButton.disabled = false;
    teleopButton.disabled = false;
    
    // Switch over to the console tab
    consoleTab.click();
});

socket.on('appStopped', function () {
    stopButton.disabled = true; 
    disableButton.disabled = true;
    autoButton.disabled = true;
    teleopButton.disabled = true;
    
    // Switch to output tab
    outputTab.click();
});

socket.on('disconnect', function () {
    console.log('Local client socket got disconnect event');
    // TODO disable everything and wait
    compileButton.disabled = true;
    stopButton.disabled = true;
    disableButton.disabled = true;
    autoButton.disabled = true;
    teleopButton.disabled = true;
    relinquishButton.disabled = true;
    connectStatusLabel.classList.remove('connected');
    connectStatusLabel.classList.add('disconnected');
    connectStatusLabel.innerText = 'No Connection To Server';
});

Split(['#editor_section', '#sidebar'], {
    sizes: [65, 35],
    minSize: 300
});

pureTabs.init('tabs__link', 'tabs__link--active');

// Set up CodeMirror
var codeEditor = CodeMirror(layoutEditorSection, {
	lineNumbers: true,
	mode: 'text/x-java',
	indentUnit: 4
});

if (FILE_TEMPLATES[0]) {
    codeEditor.setValue(FILE_TEMPLATES[0].data);
}

function onResize() {
	var height = layoutEditorSection.getBoundingClientRect().height;
	codeEditor.getWrapperElement().style.height = height + 'px';
}

// Resize logic
window.addEventListener('resize', onResize);

// Force CodeMirror to resize
onResize();

// Button Event Handlers
compileButton.addEventListener('click', function () {
	clearOutput();
    compileButton.disabled = true;
	socket.emit('compile', codeEditor.getValue());
});

stopButton.addEventListener('click', function () {
    stopButton.disabled = true;
    modeLabel.innerText = 'Disabled';
    socket.emit('stopApp');
});

relinquishButton.addEventListener('click', function () {
    socket.emit('relinquish'); 
});

clearOutputButton.addEventListener('click', clearOutput);

clearConsoleButton.addEventListener('click', clearConsole);

disableButton.addEventListener('click', function () {
    socket.emit('mode', 'disabled');
    modeLabel.innerText = 'Disabled';
});

autoButton.addEventListener('click', function () {
    socket.emit('mode', 'auto');
    modeLabel.innerText = 'Autonomous';
});

teleopButton.addEventListener('click', function () {
    socket.emit('mode', 'teleop');
    modeLabel.innerText = 'Teleop';
});

}, false);