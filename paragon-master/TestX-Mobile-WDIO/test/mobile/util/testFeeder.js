const { join, resolve } = require('path');
var fs = require('fs');
var asTable = require('as-table');
const { config } = require('process');
const { clear } = require('console');
const suiteConfig = require('../config/parallel/suiteConfig').default;
const emulatorHelper = require('../util/emulatorHelper');
const Launcher = require('@wdio/cli').default;
let emualtorNotFound;

/**
 * Test Feeder, provides the ability to feed organised test suites to wdio runner.
 * @constructor
 * @param {configFile instance} configFile - An instance of android/iOS appium config file
 */
var TestFeeder = function (configFile) {

    if (!configFile) {
        throw new Error('Test Feeder requires wdio config file path instance for instantiation');
    }

    this.configFile = configFile;
    this.fs = fs;
    this.join = join;
    this.asTable = asTable;
    this.suiteConfig = suiteConfig;
    this.Launcher = Launcher;

    //make accessible globally
    global.TestFeeder = this;
}

/**
 * display data as table.
 * @function
 * @param {Object} objects - JSON Object for data display .
 * @access private
 */
TestFeeder.prototype.displayTable = function (objects) {
    console.log(this.asTable(objects));
    console.log('');
};

/**
 * read test suite Config
 * @function
 * @param {Object} testSuiteConfig - An instane of suiteConfig.json file 
 */
TestFeeder.prototype._readConfig = function (Config) {
    return new Promise((resolve, reject) => {
        this.fs.readFile(Config, (err, buf) => {
            if (err) {
                return reject(err);
            }

            var data = null;
            try {
                data = JSON.parse(buf.toString('utf8'));
            } catch (e) {
                return reject(e);
            }

            return resolve(data);
        });
    });
};


/**
 * get specs from wdio config file.
 * @function
 * @return {Promise} - A Promise that resolves if specs files are read
 * correctly, otherwise a rejection along with the error that was detected.
 */
TestFeeder.prototype._getSpecs = function () {
    return new Promise((resolve, reject) => {

        this._readConfig(suiteConfigPath).then((configData) => {

            if (typeof (configData.suites) === 'undefined' || configData.suites.length === 0) {
                console.log('No test suite found in file' + suiteConfigPath);
                console.log("No test suites found!");
                console.log('');
                return resolve();
            }

            console.log('');
            console.log("Tests running for following test suites:");
            console.log('');

            var suites = {};
            suites = configData.suites;

            //log out what we have discovered
            this.displayTable([suites]);

            if (suites.length === 0) {
                return Promise.resolve();
            }

            return resolve(suites);

        }).catch((err) => {
            return reject(err);
        });
    })

}

/**
 * get capabilities from configurtion file.
 * @function
 * @return {Promise} - A Promise that resolves if capabilities are read
 * correctly, otherwise a rejection along with the error that was detected.
 */
TestFeeder.prototype._getCapabilities = function () {
    return new Promise((resolve, reject) => {

        this._readConfig(capabilityConfigPath).then((configData) => {

            if (typeof (configData.capabilities) === 'undefined' || configData.capabilities.length === 0) {
                console.log('No capabilities found in file' + capabilityConfigPath);
                console.log("No capabilities found!");
                console.log('');
                return resolve();
            }

            console.log("Running with following capabilities:");
            console.log('');

            var commonCapabilities = configData.commonCapabilities;

            var capabilities = configData.capabilities;

            this.maxInstances = configData.maxInstances;

            this.appiumConfig = configData.appiumConfig;

            require(this.configFile);

            const showCapabilities = capabilities.map(subCapabilities);

            function subCapabilities(value, index) {
                const subCapabilities = (({ deviceName, platformVersion }) => ({ deviceName, platformVersion }))(capabilities[index]);
                return subCapabilities
            }

            //log out what we have discovered
            this.displayTable(showCapabilities);

            if (capabilities.length === 0) {
                return Promise.resolve();
            }

            capabilities = capabilities.map(mergeCapabilities)

            function mergeCapabilities(value, index) {
                //include CLI for restserviceURL
                var processArguments = {};

                const mergeCapabilities = {
                    ...commonCapabilities,
                    ...processArguments,
                    ...capabilities[index],
                }
                return mergeCapabilities
            }

            //console.log(capabilities)
            return resolve(capabilities);

        }).catch((err) => {
            return reject(err);
        });
    })

}

/**
 * Check emulators available state.
 * @function
 * @return {Promise} - A Promise that resolves if all of the capabilities,
 * specs are parsed correctly to Launcher, otherwise a rejection along with
 * the error that was detected.
 */
TestFeeder.prototype._checkEmulatorState = function () {
    return new Promise((resolve, reject) => {
        emulatorHelper.getEmulatorState().then((EMUALTORS) => {
            return resolve(EMUALTORS);
        }).catch((err) => {
            console.log("Error getting emulator on machine under test")
            return reject(err);
        })
    }).catch();
}


/**
 * Load the wdio launcher.
 * @function
 * @return {Promise} - A Promise that resolves if all of the capabilities,
 * specs are parsed correctly to Launcher, otherwise a rejection along with
 * the error that was detected.
 */
TestFeeder.prototype._Launcher = function () {
    return new Promise((resolve, reject) => {

        this._getSpecs().then((suites) => {
            this._getCapabilities().then((capabilities) => {
                this._checkEmulatorState().then((EMUALTORS) => {
    
                    var opts = [];
                    var noOfSuites = Object.keys(suites).length

                    Object.values(suites).forEach((suite, index) => {
                        opts.push([Object.values(suite), capabilities[index]])
                            // check emualtors state available
                            if (global.env === 'ios') {
                                if(!EMUALTORS.includes(capabilities[index].platformVersion)) {
                                    console.log('\x1b[33m%s\x1b[0m', 'ERROR: Device ' + capabilities[index].deviceName + ' - OS version ' + capabilities[index].platformVersion + ' is not setup on machine under test');
                                    emualtorNotFound = true;
                                }
                            } else if (global.env === 'android') {
                                if(!EMUALTORS.includes(capabilities[index].deviceName)) {
                                    console.log('\x1b[33m%s\x1b[0m', 'ERROR: Device ' + capabilities[index].deviceName + ' - OS version ' + capabilities[index].platformVersion + ' is not setup on machine under test');
                                    emualtorNotFound = true;
                                }
                            }
                        
                    });

                    if(emualtorNotFound) {
                        process.exit(1);                      
                    }                  

                    var wdios = [];

                    opts.forEach((opt, index) => {
                        const wdio = new Launcher(this.configFile, {
                            specs: opts[index][0],
                            maxInstances: this.maxInstances,
                            capabilities: [opts[index][1]],
                            logLevel: 'debug',
                            outputDir: join(process.cwd(), 'wdiolog/suite' + (index + 1)),
                            services: [['appium', {
                                logPath: join(process.cwd(), 'appiumlog/suite' + (index + 1)),
                                logLevel: 'debug',
                                command: 'appium',
                                args: this.appiumConfig[index]
                            }]]
                        })
                        wdios.push(wdio);
                    });
                    if (wdios.length === 0) {
                        console.log("No wdios initiated");
                        return reject();
                    }

                    return resolve(wdios);

                }).catch((err) => {
                    console.log("Error getting emulator on machine under test");
                    return reject(err);
                });

            }).catch();

        }).catch();

    })
}

/**
 * Initiate the wdio runner.
 * @function
 * @param {Object} options - Any options that were provided for the task.
 * @return {Promise} - A Promise that resolves if wdio runnner is initiated
 * correctly for each launching session, otherwise a rejection along with 
 * the error that was detected.
 */
TestFeeder.prototype._Runner = function () {
    return new Promise((resolve, reject) => {

        let nooftests = 0;
        let testfinish = false;
        let devices = [];

        this._Launcher().then((wdios) => {
            wdios.forEach((wdio, index) => {
                wdios[index].run().then((code) => {
                    nooftests++;
                    if (global.env === 'android') {
                        devices.push(wdios[index]._args.capabilities[0].avd)
                    } else if (global.env === 'ios') {
                        let deviceName = wdios[index]._args.capabilities[0].deviceName + ' (' +wdios[index]._args.capabilities[0].platformVersion+')';
                        devices.push(deviceName)
                    }
                    if (nooftests === wdios.length) {
                        testfinish = true;
                    }
                    if (testfinish) {
                        return resolve(devices);
                    }

                }, (error) => {
                    console.error('Launcher failed to start the test', error.stacktrace)
                    process.exit(1)
                })

            })

        })
    }).catch((err) => {
        return reject(err);
    });
}

module.exports = function (configData) {
    return new TestFeeder(configData);
};