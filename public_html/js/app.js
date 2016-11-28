window.addEventListener('load', function () {

// HTML Elements
var layoutEditorSection = document.getElementById('editor_section');
var outputSection = document.getElementById('side-output');
var consoleSection = document.getElementById('side-console');
var compileButton = document.getElementById('compile-button');
var clearOutputButton = document.getElementById('clear-output-btn');
var outputSection = document.getElementById('output-scroll');
var clearConsoleButton = document.getElementById('clear-console-btn');
var consoleSection = document.getElementById('console-scroll');

// All Application Logic Here
var clientId;
var socket = io();

// Helper Functions
function postOutputMessage(text, isError) {
	var newItem = document.createElement('div');
	newItem.classList.add('output-item');
	if (isError) {
		newItem.classList.add('error');
	}
	// TODO Append Timestamp
	newItem.innerText = text;

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
	newItem.innerText = text;

	consoleSection.appendChild(newItem);
}

function clearConsole() {
	consoleSection.innerHTML = '';
}

// Hookup the socket events
socket.on('registration', function (data) {
	clientId = data;
})

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
	socket.emit('compile', codeEditor.getValue());
});

clearOutputButton.addEventListener('click', clearOutput);

clearConsoleButton.addEventListener('click', clearConsole);

}, false);