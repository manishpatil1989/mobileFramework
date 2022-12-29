
const exec = require('child_process').exec;

//get emulator state commands
const iosCommand = "xcrun simctl list | grep com.apple.CoreSimulator.SimRuntime.iOS | grep -vi Unavailable | awk '{print $2}'";
const emulatorDeviceCommand = "emulator -list-avds";

//get emulator ID commands
const adbDevices = "adb devices | grep emulator | awk '{print $1}'";
const iOSDevices = "xcrun simctl list | grep Booted | awk -F '[()]' '{ for (i=2; i<NF; i+=2) print $i }' | grep '^[-A-Z0-9]*$'";

//stop emulator commands
const iOSStopDeviceCommand = "xcrun simctl shutdown all";

/**
 * Return the current emualtor state for machine under test
 *   
 */
 function getEmulatorState() {
    return new Promise((resolve, reject) => {

       if (global.env === 'ios') {
        exec(iosCommand, (err, stdout, stderr) => {
            if(err) {
                console.log(err);
                return reject(err);
            }
            const EMUALTORS = stdout;
            return resolve(EMUALTORS);
        })
     } else if (global.env === 'android') {
            exec(emulatorDeviceCommand, (err, stdout, stderr) => {
                if(err) {
                    console.log(err);
                    return reject(err);
                }   
                const EMUALTORS = stdout;
                return resolve(EMUALTORS);                       
            })  
        }
    })
 }

 /**
 * Gets emualtorID open in session
 * @param  {String}   ports   emualtor portID for android only 
 * @param {String} deviceToClose device name to close
 */
 function getEmulatorToClose (ports, deviceToClose) {
    return new Promise((resolve, reject) => {
        console.log("Getting emulatorId of open devices...");
        let emulatorIDs = [];
        ports.forEach((port,index) => {
            const avdNameCmd = "(sleep 1;echo 'avd name';sleep 1) | telnet localhost "+ port +"|tail -2";
            if(global.env == 'android') {         
                let avdOpen;
                exec(avdNameCmd, (err,stdout, stderr) => {
                    if(err) {
                        return reject(err);
                    }
                avdOpen = stdout.split("\n")[0];
                if(deviceToClose.includes(avdOpen)) {
                    emulatorIDs.push("emulator-"+port)
                 }
                 if(index == (ports.length-1)) {
                    console.log("Emulator to close: "+ emulatorIDs); 
                    return resolve(emulatorIDs)
                 }     
               })
            }
        })

        if(global.env == 'ios') {
            let ioSDeviceCmd;
            if(global._checkDeviceRunning) {
                 ioSDeviceCmd = "xcrun simctl list --json devices booted | jq '[.devices | to_entries[] | (.key | capture(\"com\.apple\.CoreSimulator\.SimRuntime\.iOS\-(?<version>.+)\")) as {$version} | .value[] | {name: \"\\(.name) (\\($version|sub(\"-\"; \".\")))\", udid}]'";
            } else {
                 ioSDeviceCmd = "xcrun simctl list --json devices available | jq '[.devices | to_entries[] | (.key | capture(\"com\.apple\.CoreSimulator\.SimRuntime\.iOS\-(?<version>.+)\")) as {$version} | .value[] | {name: \"\\(.name) (\\($version|sub(\"-\"; \".\")))\", udid}]'";
            }
            exec(ioSDeviceCmd, (err,stdout, stderr) => {
                let emulatorID = [];
                if(err) {
                    return reject(err);
                }
            let devices = JSON.parse(stdout);

            for(i=0; i < devices.length; i++) {  
                for (j=0; j< deviceToClose.length; j++) {
                    if(devices[i].name == deviceToClose[j]) {
                        emulatorID.push(devices[i].udid);
                    }  
                }          
            }
            return resolve(emulatorID);   
        })
        }

    })
 }

 /**
 * Gets emualtorID open in session 
 */
 function getEmulatorID() {
    return new Promise((resolve, reject) => {
        console.log("Getting open devices...")
        let devices, deviceID;
        if(global.env == 'android') {
            exec(adbDevices, (err, stdout,stderr) => {
                if(err) {
                    console.log("ERROR LOG: {adb devices}: "+err);
                    return reject(err);
                }

                console.log("INFO LOG: {adb devices}: "+stdout);
                console.log("DEBUG LOG: {adb devices}: "+stderr)

                devices = stdout.split("\n");
                devices = devices.filter(emulator => emulator);

                console.log("Devices currently open.." +devices)

                return resolve(devices);
            })
        } else if (global.env == 'ios') {
            exec(iOSDevices, (error,stdout,stderr) => {
                if(error) {
                    if(error.code === 1) {
                        console.log(stdout)
                        return resolve(stdout);
                    }
                }
                if(stdout){
                    devices = stdout.split("\n");
                    console.log("Devices currently open.." +devices);
                    devices = devices.filter(emulator => emulator);
                    return resolve(devices);
                } else {
                    return resolve([""]);
                }
                
            })
        }
    })
 }

 /**
 * Stop emualtorID open in session 
 * @param {String} emulatorIDs emaulatorID (android) and udid (iOS) to close in a session
 */
 function stopEmulator(emulatorIDs) {
     return new Promise((resolve, reject) => {
        emulatorIDs.forEach((emulatorID,index) => {
            if(global.env == 'android') {
                const adbStopDeviceCommand = "adb -s " + emulatorID +" emu kill";
                exec(adbStopDeviceCommand, (err,stdout, stderr) => {
                    if(err) {
                        console.log(err);
                        return reject(err);
                    }
                  if(index == (emulatorIDs.length-1)){
                    return resolve();
                  }                  
                })
            } else if (global.env === 'ios') {
                console.log("Closing Simulator ID: "+emulatorID);
                const iOSStopDeviceCommand = "xcrun simctl shutdown "+emulatorID;
                exec(iOSStopDeviceCommand, (err,stdout, stderr) => {
                    if(err) {
                        console.log(err);
                        return reject(err);
                    }
                    if(index == (emulatorIDs.length-1)){
                        return resolve();
                    } 
                })
            } 
        })
       
    })
 }

module.exports =  { getEmulatorState, stopEmulator, getEmulatorID, getEmulatorToClose }
