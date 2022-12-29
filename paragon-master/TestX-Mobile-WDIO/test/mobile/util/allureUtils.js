/**
 * return the current DMA version for application under test
 * @param  {String}   capabilities    appium capabilities in a session 
 *   
 */

const { resolve } = require('path');
const { RerunFormatter } = require('cucumber');

const exec = require('child_process').exec;


 function getDMA(capabilities) {
    return new Promise((resolve, reject) => {
        const adbDeviceCommand = 'adb devices | grep emulator';
        let adbCommand;
        let udid;   
        let iosCommand = "mdls -name kMDItemVersion " + capabilities.app; 

       if (global.env === 'ios') {
        exec(iosCommand, (err, stdout, stderr) => {
            if(err) {
                console.error(err);
                return reject(err);
            }
            global.APP_VERSION = stdout.slice(16);
            return resolve(global.APP_VERSION);
        })
     } else if (global.env === 'android') {
            exec(adbDeviceCommand, (err, stdout, stderr) => {
                if(err) {
                    console.log(err);
                    return reject(err);
                }
            let android_devices = [];
            android_devices = stdout.split("\n");
            console.log(android_devices);
            if(android_devices.length > 2) {
                udid = android_devices[android_devices.length-2].slice(0,13);                
            } else {
                udid = 'emulator-5554';
            }
            adbCommand = "adb -s " + udid +" shell dumpsys package " + capabilities.appWaitPackage +" | grep versionName";
            console.log(adbCommand)
            // return resolve(udid)              
        }).then(() => {
            exec(adbCommand, (err, stdout, stderr) => {
                if(err) {
                    console.error(err);
                    return reject(err);
                }
                global.APP_VERSION = stdout.slice(16);
                return resolve(global.APP_VERSION);
              });    
        })       
            
      }  
    });    
}

module.exports =  { getDMA }
