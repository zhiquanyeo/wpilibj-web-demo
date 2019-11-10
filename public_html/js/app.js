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
var gamepadStatusLabel = document.getElementById('gamepad_status');

var loadingImage = document.getElementById('loading-icon');

var referenceSection = document.getElementById('side-reference');

var consoleAutoScrollCheckbox = document.getElementById("console_autoscroll");

// All Application Logic Here
var clientId;
var socket = io();

var isActive = false;

var templateLoaded = false;

var consoleScrollInterval = null;

// ==== GAMEPAD METHODS ====
var gamepadConnected = false;
function setGamepadConnected(connected) {
    gamepadConnected = connected;

    if (!connected) {
        gamepadStatusLabel.innerHTML = "Gamepad Disconnected";
        gamepadStatusLabel.classList.remove('connected');
        gamepadStatusLabel.classList.add('disconnected');
    }
    else {
        gamepadStatusLabel.innerHTML = "Gamepad Connected";
        gamepadStatusLabel.classList.remove('disconnected');
        gamepadStatusLabel.classList.add('connected');
    }
}

// Initial State
setGamepadConnected(false);

var gamepads = {};

function _gamepadPoll() {

    if (navigator.getGamepads()[0]) {
        setGamepadConnected(true);
        clearInterval(gamepadPollInterval);
        console.log("Have gamepad, starting loop");
        _gamepadLoop();
    }
    else {
        setGamepadConnected(false);
    }
}

var gamepadPollInterval = setInterval(_gamepadPoll, 500);

function gamepadHandler(event, connecting) {

    var gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
        gamepads[gamepad.index] = gamepad;
        console.log("Gamepad connected at index " + gamepad.index);
        setGamepadConnected(true);
        clearInterval(gamepadPollInterval);
        _gamepadLoop();

    } else {
        delete gamepads[gamepad.index];
        if (Object.keys(gamepads).length === 0) {
            setGamepadConnected(false);
            clearInterval(gamepadPollInterval);
            gamepadPollInterval = setInterval(_gamepadPoll, 500);
        }
    }
}

var gamepadRAFStart;
var lastUpdateSent = 0;
function _gamepadLoop() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
        return;
    }

    var gp = gamepads[0];
    if (!gp) {
        return;
    }

    // Get axes + buttons
    var axes = [], buttons = [];
    for (var i = 0; i < gp.axes.length; i++) {
        axes[i] = gp.axes[i].toFixed(4);
    }
    for (i = 0; i < gp.buttons.length; i++) {
        var val = gp.buttons[i];
        var pressed = val == 1.0;
        if (typeof(val) === 'object') {
            pressed = val.pressed;
            val = val.value;
        }

        buttons[i] = pressed;
    }

    // TODO Send this over the socket
    if (isActive) {
        var currTime = Date.now();
        if (currTime - lastUpdateSent > 20) {
            socket.emit('joystick', {
                axes: axes,
                buttons: buttons
            });
            lastUpdateSent = currTime;
        }

    }

    gamepadRAFStart = requestAnimationFrame(_gamepadLoop);
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);

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

// Snippet methods
var snippets = [];
var snippetSelector = document.getElementById('snippet-select');
var snippetArea = document.getElementById('snippet-area');

snippetSelector.addEventListener('change', function () {
    var idx = snippetSelector.selectedIndex;
    showSnippet(idx);
})

function showSnippet(idx) {
    if (snippets[idx]) {
        snippetArea.innerHTML = snippets[idx].data;
    }
}

function updateSnippets() {
    while(snippetSelector.firstChild) {
        snippetSelector.removeChild(snippetSelector.firstChild);
    }
    snippetArea.innerHTML = '';

    for (var i = 0; i < snippets.length; i++) {
        snippetSelector.options[i] =
            new Option(snippets[i].name, snippets[i].name);
    }

    if (snippets.length > 0) {
        showSnippet(0);
    }
    else {
        snippetArea.innerHTML = '';
    }
}

// Hookup the socket events
socket.on('registration', function (data) {
    clientId = data;
    clientIdentLabel.innerText = 'ClientID: ' + clientId;
});

socket.on('referenceData', function (data) {
    referenceSection.innerHTML = data.referenceDoc;

    // Generate the snippets
    snippets = data.snippets;
    updateSnippets();

    // Load the initial template (only if we haven't loaded before)
    if (data.templates[0] && !templateLoaded) {
        codeEditor.setValue(data.templates[0].data);
        templateLoaded = true;
    }
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
    isActive = false;
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

consoleAutoScrollCheckbox.addEventListener("change", function() {
    if (consoleAutoScrollCheckbox.checked) {
        console.log("Console auto-scroll enabled");
        consoleScrollInterval = setInterval(function () {
            consoleSection.scrollTop = consoleSection.scrollHeight;
        }, 250);
    }
    else {
        console.log("Console auto-scroll disabled");
        if (consoleScrollInterval) {
            clearInterval(consoleScrollInterval);
        }
        consoleScrollInterval = null;
    }
})

}, false);
