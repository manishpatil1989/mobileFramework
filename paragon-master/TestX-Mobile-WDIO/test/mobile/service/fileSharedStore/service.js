const { SevereServiceError } = require('webdriverio');
const logger = require('@wdio/logger').default;
const log = logger('FileSharedStoreService');
const fs = require('fs');
const { normalizeDeviceName } = require('./util');

class FileSharedStoreService {
  // constructor(serviceOptions, capabilities, config) {
  //   this.allureResultsDir = serviceOptions.allureResultsDir;
  //   this.deviceName = normalizeDeviceName(capabilities.deviceName);
  // }

  // afterFeature(uri, feature, scenarios) {
  //   const featuresExecutedOnSimulatorFile = `${this.allureResultsDir}/featuresExecutedOn${this.deviceName}.txt`;
  //   fs.appendFileSync(featuresExecutedOnSimulatorFile, uri + "\r\n");
  // }
}

exports.default = FileSharedStoreService;

