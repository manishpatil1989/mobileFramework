const fs = require('fs');
const logger = require('@wdio/logger').default;
const log = logger('DeviceDataStash');
const Device = require('./Device.js');
const Helpers = require('./Helpers.js');

class DeviceDataStash {
  constructor(deviceName) {
    this.deviceName = deviceName;
    this.storeFile = __dirname + "/../service/fileSharedStore/deviceDataOn" + Device.normalizeDeviceName(deviceName) + ".json";
    if (fs.existsSync(this.storeFile)) {
      this.data = require(this.storeFile);
      log.info(`[${deviceName}]: Loaded data from ${this.storeFile}: `, this.data);
    } else {
      log.info(`There is no data in ${this.storeFile}: `);
      this.resetData();
      log.info(`[${deviceName}]: Initialized data as: `, this.data);
    }

  }

  clearUser() {
    this.data.dma.user = null;
    this.save();
  }

  setUser(user) {
    this.data.dma.user = user;
    this.save();
  }

  getUser() {
    return this.data.dma.user;
  }

  getDMAInstalledStatus() {
    return this.data.dma.status;
  }

  setDMAStatusInstalled() {
    this.data.dma.status = 'installed';
    this.save();
  }

  resetData() {
    this.data = {
      deviceName: this.deviceName,
      dma: {
        status: 'uninstalled',
        user: null,
      }
    }

    this.save();
  }

  deleteStoreFile() {
    if (fs.existsSync(this.storeFile)) {
      log.info(`[${this.deviceName}]: deleted store file ${this.storeFile}.`)
      fs.unlinkSync(this.storeFile);
    }
  }

  save() {
    fs.writeFileSync(this.storeFile, JSON.stringify(this.data));
  }
}

module.exports = DeviceDataStash;