const actions = require('paragon-libs').actions;
const Helpers = require('../util/Helpers.js');
const os = require('os');
const execSync = require('child_process').execSync;

class Device {
    static resetApp(deviceDataStash) {
        if (global.env == 'ios') {
            if(deviceDataStash.getDMAInstalledStatus() === 'installed') {
                console.log("DMA specificed for this run has already been installed");
                    browser.terminateApp(global.DMA_APP_NAME);
                    browser.execute("mobile: launchApp", {
                        bundleId: global.DMA_APP_NAME,
                        arguments: [
                            // "-sampleArg", "true"
                        ],
                    });
            } else {
                console.log("DMA specificed for this run has not been installed");
                browser.closeApp();
                this.uninstallApp(deviceDataStash);
                console.log("Installing specificed DMA");
                browser.launchApp();
                deviceDataStash.setDMAStatusInstalled();
            }
        } else {
            //TODO: Make Android also not re-install DMA app when deviceDataStash indicate DMA already been installed
            browser.closeApp();
            this.uninstallApp(deviceDataStash);
            browser.launchApp();
            deviceDataStash.setDMAStatusInstalled();
        }
    }

    /**
     * Clear Data for Android DMA
     */
     static clearAndroidAppData() {
        const strCommand = 'adb -s ' + browser.capabilities.deviceName + ' shell pm clear com.pcloudy.appiumdemo';
        Helpers.executeSync(strCommand);
    }

    /**
     * Restart app without remove the app data
     * (Session restarted effectively)
     */
    static restartApp() {
        // Restart the app without removing the data
        if (global.env == 'ios') {
            browser.reset();
        } else {
            browser.closeApp();
            browser.background(1);
            browser.launchApp();
        }
    }

    /**
    * Activate app when app is running at background
    * 
    */
    static activateApp() {
        if (global.env == 'ios') {
            browser.execute("mobile: launchApp", {
                bundleId: global.DMA_APP_NAME,
                arguments: [
                    // "-sampleArg", "true"
                ],
            });
        } else {
            browser.activateApp('com.pcloudy.appiumdemo');
        }
    }

    /**
     * Uninstall app
     */
    static uninstallApp(deviceDataStash) {
        if (global.env == 'ios') {
            browser.removeApp(global.DMA_APP_NAME);
        } else {
            browser.removeApp("com.pcloudy.appiumdemo");
        }
        deviceDataStash.resetData();
    }

    static getiOSEmulatorDeviceID(deviceName, platformVersion){
        const emulatorInUse = `^${deviceName} Simulator (${platformVersion})`;
        const instrumentCmdToGetDeviceID = `xcrun xctrace list devices | grep '${emulatorInUse}' | awk -F'(' '{print $3}' | awk -F')' 'NR==1{print $1}'`;
        return execSync(instrumentCmdToGetDeviceID, { encoding: 'utf-8' }).trim();
    }

    static addImageIntoGallery(absoluteFilePath) {
        if (global.env == 'ios') {
            actions.pause('1000');
            const deviceId = this.getiOSEmulatorDeviceID(browser.capabilities.deviceName, browser.capabilities.platformVersion);
            //Get the latest Image folder and the second to latest Image folder(if exists). Then replace all image files with testing image.
            const DCIMDir = `~/Library/Developer/CoreSimulator/Devices/${deviceId}/data/Media/DCIM/`;
            const cmdToGetLatestTwoDCIMDir = `ls -t ${DCIMDir} | head -n2`;
            const latestTwoDCIMdir = execSync(cmdToGetLatestTwoDCIMDir, { encoding: 'utf-8' });
            latestTwoDCIMdir.split(os.EOL).forEach(function (imageFolder) {
                if (imageFolder.trim() != '') {
                    imageFolder = imageFolder.trim();
                    let imgsReplaceCmd = `for i in ${DCIMDir}${imageFolder}/*.*; do cp -f ${absoluteFilePath} "$i"; done`;
                    Helpers.executeSync(imgsReplaceCmd);
                }
            });
        } else if (global.env == 'android') {
            let strCommand = 'adb -s ' + browser.capabilities.deviceName + ' shell rm -rf /sdcard/Download/*.png';
            Helpers.executeSync(strCommand);
            var imgPushCmd = 'adb -s ' + browser.capabilities.deviceName + ' push ' + absoluteFilePath + ' /sdcard/Download';
            Helpers.executeSync(imgPushCmd);
        }
    }

    static selectImageFromGallery(filename) {
        if (global.env == 'ios') {
            actions.pause('1000');
            //Click on Recent Album
            browser.touchAction({
                action: 'tap', x: 50, y: 310
            });
            actions.pause('2000');
            //Click on the Top Left corner Image
            browser.touchAction({
                action: 'tap', x: 50, y: 140
            });

        } else if (global.env == 'android') {
            var xpath = "//android.widget.TextView[contains(@text, '" + filename + "')]";
            try {
                $(xpath).click();
            } catch (e) { // This block of code is to handle different andriod simulators
                $("//android.widget.ImageButton[@content-desc='Show roots']").click();
                $("//android.widget.TextView[contains(@text, 'Downloads')]").click();
                $(xpath).click();
            }
        }
    }

    static normalizeDeviceName(name) {
      return name.replace(/ /g, '_');
    }
}

module.exports = Device;