const { SevereServiceError } = require('webdriverio');
const logger = require('@wdio/logger').default;
const DeviceDataStash = require('../../util/DeviceDataStash.js');

class FileSharedStoreLauncher {
  constructor(serviceOptions, capabilities, config) {
    this.deviceDataStash = new DeviceDataStash(capabilities[0].deviceName);
  }

  onPrepare(config, capabilities) {
    this.deviceDataStash.deleteStoreFile();
  }
}

exports.default = FileSharedStoreLauncher;

