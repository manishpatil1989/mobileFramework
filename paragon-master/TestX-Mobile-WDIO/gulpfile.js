const gulp = require("gulp"),
 webdriver = require("gulp-webdriver"),
 path = require('path'),
 argv = require('yargs').argv,
 allure = require('allure-commandline'),
 fs = require('fs'),
 execSync = require('child_process').execSync,
 emulatorHelper = require('./test/mobile/util/emulatorHelper'),
 deepmerge = require('deepmerge'),
 Helpers = require('./test/mobile/util/Helpers.js');
 exec = require('child_process').exec;
 global._TESTFEEDER = false;

 const allureConfigFile = './test/mobile/config/allure/allureConfig.json';
 const androidAllureReportResults = './test/mobile/reports/allure-results-android/categories.json';
 const iOSAllureReportResults = './test/mobile/reports/allure-results-ios/categories.json';

 const copyAllureConfigAndroidCmd = 'cp ' + allureConfigFile + ' ' + androidAllureReportResults;
 const copyAllureConfigiOSCmd = 'cp ' + allureConfigFile + ' ' + iOSAllureReportResults;

 const allFeatureFilesFolder = [ 'test/mobile/features/featureFiles/**/*.feature' ];
 const tags = argv.tags || '';

 require("@babel/register")({
     presets: ["@babel/preset-env"]
 });

let isWin = /^win/.test(process.platform),
 cmd = isWin ? 'wdio.cmd' : 'wdio',
wdioBin = path.join(__dirname, 'node_modules', '.bin', isWin ? 'wdio.cmd' : 'wdio');

function prepareParallelConfigs(channel) {
    if (argv.parallel && argv.parallel.factor) {
        const parallelFactor = parseInt(argv.parallel.factor);
        if (parallelFactor > 4) {
            console.log("Maximum parallelFactor exceeded!")
            done();
            process.exit();
        }
        const featureFilesDistributor = require('./test/mobile/util/FeatureFilesDistributor')(parallelFactor, allFeatureFilesFolder, tags);
        const suiteConfig = featureFilesDistributor.distributeFeatureFiles();

        suiteConfigPath = __dirname + '/test/mobile/config/parallel/' + channel + '.suiteConfig_factor_' + parallelFactor + '.json';
        fs.writeFileSync(suiteConfigPath, JSON.stringify(suiteConfig));
        capabilityConfigPath = __dirname + '/test/mobile/config/parallel/' + channel +'.parallelCapabilities_max.json';
    } else {
        suiteConfigPath = __dirname + '/test/mobile/config/parallel/suiteConfig.json';
        capabilityConfigPath = __dirname + '/test/mobile/config/parallel/' + channel + '.parallelCapabilities.json';
    }
    return {
        suiteConfigPath,
        capabilityConfigPath
    }
}

gulp.task('default', function(done) {
    console.log('=====Missing arguments please provide a taskname to execute====');
    done();
});

gulp.task('get:component', (done) => {
    let packageFile = __dirname + '/package.json';
    var componentInstaller = require('./test/mobile/util/componentInstaller')(packageFile);
    global.componentfilePath = (argv.component) ? argv.component : 'Sapient';
    componentInstaller.install(packageFile).then(done).catch(done);
});


gulp.task('test:web', function() {
    return gulp.src('./test/web/config/suite.selenium.conf.js').pipe(webdriver({
        logLevel: 'verbose',
        waitforTimeout: 10000
    }));
});

gulp.task('test:ios', function(done) {
    return gulp.src('./test/mobile/config/ios.appium.conf.js').pipe(webdriver({
        //logLevel: 'debug',
        waitforTimeout: 60000
    })).once('error', function () {
        console.log("Task has an error occurred")
        done();
        process.exit(1);
    }).once('end', function () {
        console.log("Task is completed")
        done();
        process.exit();
    });
});

gulp.task('test:ios-parallel', function(done) {
    global._TESTFEEDER = true;
    let iOSConfig = __dirname + '/test/mobile/config/ios.appium.conf.js';
    var testFeeder = require('./test/mobile/util/testFeeder')(iOSConfig);
    const parallelConfigs = prepareParallelConfigs('ios');
    ({suiteConfigPath, capabilityConfigPath} = parallelConfigs);
    testFeeder._Runner().then((devices) => {
        console.log(devices);
        emulatorHelper.getEmulatorID().then((emulatorIDs) => {
            console.log(emulatorIDs);
            if(emulatorIDs) {
                emulatorHelper.getEmulatorToClose(devices, devices).then((emulatorIDs) => {
                    console.log("Calling to close emulator..."+emulatorIDs);
                    emulatorHelper.stopEmulator(emulatorIDs).then(() => {
                        done();
                        process.exit();
                    }).catch((err) => {
                        console.log(err);
                        done();
                        process.exit(1);
                    }) 
                }).catch((err) => {
                    console.log(err);
                    done();
                    process.exit(1);
                })
            }      
        }).catch((err) => {
            console.log(err);
            done();
            process.exit(1);
        })
    }).catch((error) => {
        console.log(error);
        done();
        process.exit(1);
    });
});

gulp.task('test:android', function(done) {
    global.deviceToClose = "";
    return gulp.src('./test/mobile/config/android.appium.conf.js').pipe(webdriver({
        // logLevel: 'silent',
        waitforTimeout: 60000
    })).once('error', function () {
        done();
        process.exit(1);
    }).once('end', function () {
        done();
        process.exit();
    })
});

gulp.task('test:android-parallel', function(done) {
    global._TESTFEEDER = true;
    let ports = [];
    let androidConfig = __dirname + '/test/mobile/config/android.appium.conf.js';
    var testFeeder = require('./test/mobile/util/testFeeder')(androidConfig);
    const parallelConfigs = prepareParallelConfigs('android');
    ({suiteConfigPath, capabilityConfigPath} = parallelConfigs);
    testFeeder._Runner().then((devices) => {
        console.log(devices);
        emulatorHelper.getEmulatorID().then((emulatorIDs) => {
            if(emulatorIDs) {
                emulatorIDs.forEach(emulator => {
                    ports.push(emulator.split('-')[1]) 
                });
            }
            emulatorHelper.getEmulatorToClose(ports,devices).then((emulatorIDs) => {
                emulatorHelper.stopEmulator(emulatorIDs).then(() => {
                    done();
                    process.exit();
                }).catch((err) => {
                    console.log(err);
                    done();
                    process.exit(1);
                }) 
            }).catch((err) => {
                console.log(err);
                done();
                process.exit(1);
            })
        }).catch((err) => {
            console.log(err);
            done();
            process.exit(1);
        })
    }).catch((error) => {
        console.log(error);
        done();
        process.exit(1);
    });
})


gulp.task('test:api', function() {
    console.log(wdioBin);
    return gulp.src('./test/api/config/suite.api.conf.js').pipe(webdriver({
        wdioBin: path.join(__dirname, 'node_modules', '.bin', cmd),
        logLevel: 'verbose',
        waitforTimeout: 10000
    }));
});

gulp.task('get:allure-report-ios', function(cb) {
    execSync(copyAllureConfigiOSCmd, { encoding: 'utf-8' });
    const cmdToGenerateTestNumberStatsEnv = 'cat ./test/mobile/reports/allure-results-ios/testNumberOn* > ./test/mobile/reports/allure-results-ios/environment.properties';
    execSync(cmdToGenerateTestNumberStatsEnv, { encoding: 'utf-8' });
    exec('./node_modules/.bin/allure generate --clean ./test/mobile/reports/allure-results-ios && ./node_modules/.bin/allure open -h 0.0.0.0', 
    function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('get:allure-report-android', function(cb) {
    execSync(copyAllureConfigAndroidCmd, { encoding: 'utf-8' });
    const cmdToGenerateTestNumberStatsEnv = 'cat ./test/mobile/reports/allure-results-android/testNumberOn* > ./test/mobile/reports/allure-results-android/environment.properties';
    execSync(cmdToGenerateTestNumberStatsEnv, { encoding: 'utf-8' });
    exec('./node_modules/.bin/allure generate --clean ./test/mobile/reports/allure-results-android && ./node_modules/.bin/allure open -h 0.0.0.0', 
    function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
});

gulp.task('get:test-case-number', function(done) {
    const tags = argv.tags || '';
    exec(`node ./test/mobile/util/caseCounter.js ${tags}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done(err);
      });
});

module.exports = gulp;