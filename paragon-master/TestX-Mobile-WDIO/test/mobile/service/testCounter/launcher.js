const { SevereServiceError } = require('webdriverio');
const logger = require('@wdio/logger').default;
const log = logger('TestCounterService');
const fs = require('fs');
const execSync = require('child_process').execSync;
const { normalizeDeviceName } = require('./util');

class TestCounterLauncher {
  constructor(serviceOptions, capabilities, config) {
    this.allureResultsDir = serviceOptions.allureResultsDir;
    this.deviceName = normalizeDeviceName(capabilities[0].deviceName);
  }

  onPrepare(config, capabilities) {
    const featuresExecutedOnSimulatorFile = `${this.allureResultsDir}/featuresExecutedOn${this.deviceName}.txt`;
    execSync(`mkdir -p ${this.allureResultsDir}`, { encoding: 'utf-8' });
    execSync(`touch ${featuresExecutedOnSimulatorFile}`, { encoding: 'utf-8' });
  }

  onComplete(exitCode, config, capabilities) {
    const testNumberFile = `${this.allureResultsDir}/testNumberOn${this.deviceName}.txt`;
    const testNumbersForDevice = `feature_file_numbers_on_simulator_${this.deviceName}=expected: ${config.specs.length}, actual: `
    fs.writeFileSync(testNumberFile, testNumbersForDevice);

    const featuresExecutedOnSimulatorFile = `${this.allureResultsDir}/featuresExecutedOn${this.deviceName}.txt`;
    const cmdToAppendAcutalTestNumber = `grep -c ".*" ${featuresExecutedOnSimulatorFile} >> ${testNumberFile}`;
    execSync(cmdToAppendAcutalTestNumber, { encoding: 'utf-8' });
  }
}

exports.default = TestCounterLauncher;

