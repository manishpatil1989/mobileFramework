"use strict";
global.env = 'android';
const defaultTimeoutInterval = process.env.DEBUG ? (60 * 60 * 500) : 60000;
const { join } = require('path');

const argv = require('../util/argvHandler.js'),
featureFileHelper = require('../util/featureFileHelper'),
emulatorHelper = require('../util/emulatorHelper'),
Helpers = require('../util/Helpers.js'),
TestEnv = require('../util/TestEnv.js'),
defaultTags = ['not ~@descoped', 'not ~@manual', 'not ~@wip'];
const Device = require('../util/Device.js');

const deviceInfoList = require('./android.device.conf').deviceInfoList;
let base64Img = require('base64-img');

const video = require('wdio-video-reporter');

const reporter = require('@wdio/allure-reporter').default;
const propReader = require('properties-reader');
const allureProperties = propReader(join(process.cwd(),'allure-project.properties'));
const testPararmeterParser = require('../util/LineNumberedTestParameterParser.js');

let WORK_ITEMS_URL = 'https://[WORK_ITEMS_URL]'

//specs file to be executed
process.env.ff = (argv.ff) ? argv.ff : process.env.ff;
let featureFilePath = featureFileHelper(process.env.ff);

//setting up wait time for elements to be visible
process.env.wt = (argv.wt) ? argv.wt : process.env.wt;
global.waitForTime = process.env.wt == 'undefined' ? 30000 : argv.wt;

//device & OS version for test orchestration
process.env.deviceInfo = argv.deviceInfo ? argv.deviceInfo : process.env.deviceInfo;
const deviceInfo = !process.env.deviceInfo || process.env.deviceInfo === 'undefined' ? 'deviceInfo_Default' : process.env.deviceInfo;

//ignore open devices
process.env.ignoreDevice = (argv.ignoreDevice) ? argv.ignoreDevice : process.env.ignoreDevice;
const ignoreDevice = process.env.ignoreDevice == 'undefined' ? false : argv.ignoreDevice;

//enable device/emulator logs
process.env.deviceLogs = (argv.deviceLogs) ? argv.deviceLogs : process.env.deviceLogs;
const showDeviceLogs = process.env.deviceLogs == 'undefined' ? false : argv.deviceLogs;

const deviceCapability  = deviceInfoList.getdeviceInfo(deviceInfo);
global.deviceCapability = deviceCapability;

global.pageObjectFile = join(process.cwd(), 'test/mobile/pageobjects');

global.platformEnv = global.datafilePath = (argv.env) ? argv.env : 'env1';

//reboot emulator
global.rebootEmulator = (argv.reboot) ? argv.reboot : false;

const takesScreenShotUponFailure = (argv.reporter && argv.reporter.debug) || (argv.reporter && argv.reporter.screenshot);

global.visualCheckEnabled = (argv.tags && argv.tags.includes("visualCheck")) || (argv.visualCheck && argv.visualCheck.enabled);

let cucumberFeaturesWithLineNumbers;
[cucumberFeaturesWithLineNumbers, featureFilePath] = testPararmeterParser.parse(argv.test, featureFilePath);

let tags = ['@unit'];
if(argv.tags) {
  tags = tags.concat(argv.tags.split(','));
} else {
  tags = defaultTags;
}

var driverLogs = ['logcat', 'bugreport', 'server'];
if(showDeviceLogs) {
  driverLogs = driverLogs.filter(driverLog => driverLog !== 'logcat')
}

const filterTagsInSpecFlag = argv.filter && argv.filter.specTags;

const config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',
   // port: 4724,
    featureFlags: {
    specFiltering: true
    },

    cucumberFeaturesWithLineNumbers: cucumberFeaturesWithLineNumbers,

    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: featureFilePath,

    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 1,
    maxInstancesPerCapability: 1,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        automationName: "UiAutomator2",
        appiumVersion: '1.22.2',
        platformName: "Android",
        deviceType: "phone",
        platformVersion: deviceCapability.platformVersion,
        avd: deviceCapability.deviceName,
        allowDelayAdb: false,
        deviceName : deviceCapability.deviceName,
        orientation: 'PORTRAIT',
        maxInstances: 10,
        udid : deviceCapability.udid,
        systemPort : deviceCapability.systemPort,
        app: join(process.cwd(), './apps/android/TestApp.apk'),
        appWaitPackage: 'com.pcloudy.appiumdemo',
        appWaitActivity: 'com.ba.mobile.LaunchActivity',
        appWaitDuration: 30000,
        appWaitForLaunch: true,
        uiautomator2ServerInstallTimeout: 180000,
        newCommandTimeout: 30000,
        skipServerInstallation: false,
        dontStopAppOnReset: false,
        show_on_first_run_allowed : false,
        show_welcome_page: false,
        autoGrantPermissions: true,
        noReset: true,
        autoAcceptAlerts: true,
        avdLaunchTimeout: 300000,
        avdReadyTimeout: 300000,
        noSign: true,
        uiautomator2ServerLaunchTimeout: 120000,
        adbExecTimeout: 180000, //default is 20000 ms
        androidInstallTimeout: 180000,
        deviceReadyTimeout: 180,
        excludeDriverLogs: driverLogs,
        gpsEnabled: false,
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //

    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'trace',
    // outputDir: './',
    coloredLogs: true,      // Enables colors for log output.
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner, @wdio/lambda-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //   webdriver: 'silent',
    //     // 'wdio-video-reporter': 'silent'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: global.waitForTime,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout:  180000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    //port: 4724,
    services: [
      ...((global._TESTFEEDER) ? [] :
      [['appium', {
        logPath : `${process.cwd()}/wdiolog`,
        // command: 'appium',
        args: {
        address: '127.0.0.1',
        port: deviceCapability.appiumPort,
        // avdArgs: '-read-only',
        reboot: global.rebootEmulator,
        commandTimeout:  30000,
        sessionOverride: true,
        debugLogSpacing: true,
        logTimestamp: true,
        localTimezone: true,
        preLaunch:true,
        deviceReadyTimeout: 180000
        }
      }]]),
      ['native-app-compare', {
            autoSaveBaseline: true,
            savePerDevice: true,
            ignoreTransparentPixel: true,
            ignoreAntialiasing: true,
            baselineFolder: join(process.cwd(), './test/mobile/visualBaseline/android'),
            screenshotPath: join(process.cwd(), './test/mobile/reports/android-visual'),
            imageNameFormat: '{tag}-{deviceName}-{platformVersion}',
            blockOutStatusBar: true,
            blockOutNavigationBar: true,
            debug: false
        }],
        [join(process.cwd(), './test/mobile/service/testCounter/index.js'), {
          allureResultsDir : './test/mobile/reports/allure-results-android/'
        }],
        [join(process.cwd(), './test/mobile/service/fileSharedStore/index.js')],
        [join(process.cwd(), './test/mobile/service/stepLogger.js')],

    ],

    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'cucumber',
    //
    // The number of times to retry the entire specfile when it fails as a whole
    specFileRetries: argv.retries || 0,
    //
    // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
    specFileRetriesDeferred: true,
    //specFileRetriesDelay: 0,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter.html
    // outputDir: './test/mobile/reports/video-android/_wivideo_',
    reporters: [
        'spec',
        ['json', {
          outputDir: './test/mobile/reports/json-results/android/'
        }],
      ...((argv.reporter && argv.reporter.noVideo) ? [] :
          [[video, {
            saveAllVideos: false,
            videoSlowdownMultiplier: 3,
            videoRenderTimeout: 10,
            outputDir: './test/mobile/reports/video-android/',
            //addExcludedActions: ['displayed', 'enabled']
          }]]),
       ['allure', {
          outputDir: './test/mobile/reports/allure-results-android/',
          disableWebdriverStepsReporting: true,
          disableWebdriverScreenshotsReporting: !takesScreenShotUponFailure,
          useCucumberStepReporter: true,
          issueLinkTemplate: WORK_ITEMS_URL,
          tmsLinkTemplate: WORK_ITEMS_URL,  
        }],     
    ],
    reporterSyncTimeout: 30 * 1000,
    reporterSyncInterval: 1000,
    //
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        requireModule: ['@babel/register'],
        // <string[]> (file/dir) require files before executing features
        require: require('glob').sync('./test/mobile/features/stepDefinitions/*.js'),
        // <boolean> show full backtrace for errors
        backtrace: true,
        // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        failAmbiguousDefinitions: true,
        // <boolean> invoke formatters without executing steps
        dryRun: false,
        name: [], 
        // <boolean> abort the run on first failure
        failFast: false,
        compiler: [],
        // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
        format: ['pretty'],
        // <boolean> hide step definition snippets for pending steps
        colors: true,       
        // <boolean> disable colors in formatter output
        snippets: false,
        // <boolean> hide source uris
        source: true,
        // <string[]> (name) specify the profile to use
        profile: [],
        // <boolean> fail if there are any undefined or pending steps
        strict: false,
        // <string> (expression) only execute the features or scenarios with tags matching the expression
        tagExpression: (tags.join(" or ")),
        // <number> timeout for step definitions
        timeout: defaultTimeoutInterval,
        // <boolean> add cucumber tags to feature or scenario name
        tagsInTitle: false, 
        scenarioLevelReporter: false,                
        // <boolean> Enable this config to treat undefined definitions as warnings.
        ignoreUndefinedDefinitions: false
    },
    
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
      //check emulator state if available/configured on machine under test
      if(!global._TESTFEEDER) {
      return new Promise((resolve,reject) => {
          emulatorHelper.getEmulatorState().then((EMUALTORS) => {
            if(!EMUALTORS.includes(deviceCapability.deviceName)) {
              console.log('\x1b[33m%s\x1b[0m', 'ERROR: Device ' + deviceCapability.deviceName + ' - OS version ' + deviceCapability.platformVersion + ' is not setup on machine');
              return reject();
            }
            /**
             * Gets emulator state if already in use 
             */
            emulatorHelper.getEmulatorID().then((devices) => {
              if(devices.length) {
                let ports = [];
                devices.forEach(emulator => {
                  ports.push(emulator.split('-')[1]) 
                });
                
                emulatorHelper.getEmulatorToClose(ports,capabilities[0].avd).then((emulatorID) => {
                  if(emulatorID.length && !ignoreDevice) {
                    console.log('\x1b[33m%s\x1b[0m', 'ERROR: Device ' + capabilities[0].avd + ' already in use');
                    return reject();
                  } else {
                    return resolve();
                  }
                }).catch((err) => {
                  console.log(err);
                  return reject(err);
                })
              } else {
                return resolve();
              }
            })            
          });
      })
     }

    },
    /**
     * Gets executed before a worker process is spawned and can be used to initialise specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {String} cid      capability id (e.g 0-0)
     * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {[type]} specs    specs to be run in the worker process
     * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
     * @param  {[type]} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    beforeSession: function (config, capabilities, specs) {
    },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: function (capabilities, specs) {
      /**
       * Setup the Chai assertion framework
       */
      const chai    = require('chai');
      global.expect = chai.expect;
      global.assert = chai.assert;
      global.should = chai.should();
      /**
       * Setup the Allure envoirnment configurations
       */
      this.platformName = capabilities.platformName;
      this.platformVersion = capabilities.platformVersion;
      this.udid = capabilities.udid;
      /**
       * Emulator cleanup
       */
       if (!(argv.um && argv.um.skipReg)) {
        Helpers.resetChromeBrowser();
        Helpers.cleanupAndroidEmulatorImages();
      } 
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Runs before a Cucumber feature
     */
    // beforeFeature: function (uri, feature, scenarios) {
      
    // },
    /**
     * Runs before a Cucumber scenario
     */
    beforeScenario: function (world, context) {
      const HttpTrafficInScenario = require('../util/HttpTrafficInScenario');
      global.httpTrafficInScenario = new HttpTrafficInScenario();

      driver.updateSettings({"waitForIdleTimeout": 1000});
      const scenario = world.gherkinDocument.feature;
      scenario.tags.forEach(tag => {
        if(tag.name.toLowerCase().includes("setwaitforidletimeout")) {
          driver.updateSettings({"waitForIdleTimeout": 1000});
        }

        if(tag.name.toLowerCase().includes("setwaitforidletimeouttozero")) {
          driver.updateSettings({"waitForIdleTimeout": 0});
        }
      });
      global.failVisualCheckDiffPath = null;
    },
    /**
     * Runs before a Cucumber step
     */
    // beforeStep: function ({ uri, feature, step }, context) {
    // },
    /**
     * Runs after a Cucumber step
     */
    // afterStep: function ({ uri, feature, step }, context, { error, result, duration, passed, retries }) {
    // },
    /**
     * Runs after a Cucumber scenario
     */
    afterScenario: function (world, result, context) {
       reporter.addEnvironment('PLATFORM:', this.platformName);
       reporter.addEnvironment('OS :', global.deviceCapability.platformVersion);
       reporter.addEnvironment('DEVICE :', global.deviceCapability.udid);
       reporter.addEnvironment('BUILD VERSION :', global.APP_VERSION);
       reporter.addEnvironment('RELEASE:', allureProperties.get('allure.project.release'));
       reporter.addEnvironment('TEST ENVIRONMENT:', global.platformEnv);
       reporter.addEnvironment('Branch', TestEnv.gitBranch());
       reporter.addEnvironment('Revision', TestEnv.gitRevision());       
       reporter.addEnvironment('Slave Machine', TestEnv.slaveMachine());
       reporter.addEnvironment('Slave Machine OS', TestEnv.slaveMachineOS());
       reporter.addEnvironment('Slave Machine OS Release', TestEnv.macosRelease());
       reporter.addEnvironment('Node', TestEnv.nodeVersion());
       reporter.addEnvironment('XCode', TestEnv.xcodeVersion());
       reporter.addEnvironment('Java', TestEnv.javaVersion());
       reporter.addEnvironment('Appium', TestEnv.appiumVersion());

       const scenario = world.gherkinDocument.feature;

       scenario.tags.forEach(tag => {
        if(tag.name.toLowerCase().includes("story")) {
          let testID = tag.name.slice(7,(tag.name.length-1));
          reporter.addTestId(testID)
          
        }

        if(tag.name.toLowerCase().includes("bug")) {
          let bugID = tag.name.slice(5,(tag.name.length-1));
          reporter.addIssue(bugID)
        }

      });

    },
    /**
     * Runs after a Cucumber feature
     */
    // afterFeature: function (uri, feature, scenarios) {
    // },
    
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    afterCommand: function (commandName, args, result, error) {
      if (result && result.misMatchPercentage) {
        let imageTo64 = base64Img
        .base64Sync(`${result.folders.diff}/${result.fileName}`)
        .replace('data:image/png;base64,', '');
        reporter.addAttachment('Diff image', Buffer.from(imageTo64, 'base64'),'image/png')
      }
    },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: function(exitCode, config, capabilities, results) {
      /**
       * Close emulator open during session
       */
      if(!global._TESTFEEDER) {
        return new Promise((resolve, reject) => {
          emulatorHelper.getEmulatorID().then((devices) => {
              if(devices) {
                let ports = [];
                devices.forEach(emulator => {
                  ports.push(emulator.split('-')[1]) 
                });
                  emulatorHelper.getEmulatorToClose(ports,capabilities[0].avd).then((emulatorID) => {
                    global.deviceToClose = emulatorID;
                    console.log("Calling to close emulator..."+emulatorID);
                    emulatorHelper.stopEmulator(global.deviceToClose).then(() => {
                      console.log("Emualtor " + global.deviceToClose + " closed!");
                      return resolve();
                    }).catch((err) => {
                      console.log("Emualtor " + global.deviceToClose + " closing failed!");
                      console.log(err)
                      return reject();
                      })
                    return resolve();
                  }).catch((err) => {
                    console.log("Error getting avd Name!");
                    console.log(err)
                    return reject();
                  })
              } else {
                return reject();
              }              
            })
        })
      }


    },
    /**
    * Gets executed when a refresh happens.
    * @param {String} oldSessionId session ID of the old session
    * @param {String} newSessionId session ID of the new session
    */
    //onReload: function(oldSessionId, newSessionId) {
    //}
};

if(filterTagsInSpecFlag) {
  exports.config = require('../util/spec.filter.by.tags.js').filter_by_tag(config);
} else {
  exports.config = config;
}