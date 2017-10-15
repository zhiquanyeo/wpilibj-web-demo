const { Constants } = require('@ftl-robots/ftl-robot-host');

function getConfig(type) {
    var configType = 'debug';
    if (type === 'normal') {
        configType = 'normal';
    }

    var i2cImplementation, deviceSpec;
    if (type === 'debug') {
        var MockI2C = require('@ftl-robots/ftl-mocks').I2C;
        var MockAStar = require('@ftl-robots/ftl-mocks').AstarBoard;
        
        console.log('Starting Mock I2C on *:5001');
        i2cImplementation = new MockI2C(5001);
        deviceSpec = {
            id: 'main-board',
            type: 'PololuAstarBoard',
            interfaceId: 'i2c',
            config: {
                addr: 20
            }
        };

        // Also start up the fake Astar board
        console.log('Starting Mock Astar Board on *:5002');
        var mockBoard = new MockAStar(i2cImplementation, 5002);
    }
    else {
        var RaspiI2C = require('@ftl-robots/ftl-standard-interface-hw-raspi').RaspiI2C;
        i2cImplementation = new RaspiI2C(1);
        deviceSpec = {
            id: 'main-board',
            type: 'PololuAstarBoard',
            interfaceId: 'i2c',
            config: {
                addr: 20
            }
        };
    }

    var config = {
        interfaces: [
            {
                id: 'i2c',
                type: Constants.InterfaceTypes.I2C,
                implementation: i2cImplementation
            }
        ],
        devices: [
            deviceSpec
        ],
        portMap: {
            'D-0': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-LED',
                devicePort: 'RED'
            },
            'D-1': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-LED',
                devicePort: 'YELLOW'
            },
            'D-2': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-LED',
                devicePort: 'GREEN'
            },
            'D-3': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.DIGITAL,
                devicePort: 0
            },
            'D-4': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.DIGITAL,
                devicePort: 1
            },
            'D-5': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.DIGITAL,
                devicePort: 2
            },
            // Virtual digital ports for buttons
            'D-6': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-BUTTON',
                devicePort: 'A'
            },
            'D-7': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-BUTTON',
                devicePort: 'B'
            },
            'D-8': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-BUTTON',
                devicePort: 'C'
            },
            'A-0': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.ANALOG,
                devicePort: 0
            },
            'A-1': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.ANALOG,
                devicePort: 1
            },
            'A-2': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.ANALOG,
                devicePort: 2
            },
            'A-3': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.ANALOG,
                devicePort: 3
            },
            'A-4': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.ANALOG,
                devicePort: 4
            },
            'batt': {
                deviceId: 'main-board',
                devicePortType: 'ASTAR-BATT',
                devicePort: 'batt'
            },
            'PWM-0': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.PWM,
                devicePort: 0
            },
            'PWM-1': {
                deviceId: 'main-board',
                devicePortType: Constants.PortTypes.PWM,
                devicePort: 1
            },
        }
    };

    return config;
}

module.exports = {
    getConfig: getConfig
};