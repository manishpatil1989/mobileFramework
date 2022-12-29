const selectorHelper = require('paragon-libs').helpers.selectorHelper,
    actions = require('paragon-libs').actions,
    commandHelper = require('paragon-libs').helpers.commandHelper,
    utilChecks = require('../util/checks.js'),
    utilActions = require('../util/actions.js');

const XPATH_KEYBOARD_NEXT = "//XCUIElementTypeButton[@name='Next:'] | //XCUIElementTypeToolbar/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeButton[@name='btnNext']";
const XPATH_KEYBOARD_DONE = "//XCUIElementTypeButton[@name='btnToolbarDone'] | //XCUIElementTypeButton[contains(@name,'Done') or contains(@label,'Done') or contains(@name,'done') or contains(@label,'done')]";
class Helpers {
    iosNumericKeyboardNext() {
        browser.$(XPATH_KEYBOARD_NEXT).click();
    }
    iosAlphaNumericKeyboardNext() {
        browser.$(XPATH_KEYBOARD_NEXT).click();
    }
    iosAlphaNumericKeyboardDone() {
        browser.$(XPATH_KEYBOARD_DONE).click();
    }

    iosNumericKeyboardDone() {
        browser.$(XPATH_KEYBOARD_DONE).click();
    }

    keyboardNext() {
        if (global.env == 'ios') {
            browser.$(XPATH_KEYBOARD_NEXT).click();
        } else {
            // Note: Do not use touch specific location, because we want to make sure the button is "Next" or "Done".
            // browser.touchAction({
            //     action: 'tap', x: 937, y: 1695
            // });
            // Note: please do not use browser.pressKeyCode(ANDROID_KEYCODE_ENTER_OR_NEXT_KEY)  
            //       because the behaviour on simulator is different with manual interaction on real device
            browser.execute('mobile: performEditorAction', { "action": "Next" });
        }
    }

    numericKeyboardNext() {
        if (global.env == 'ios') {
            browser.$(XPATH_KEYBOARD_NEXT).click();
        } else {
            browser.touchAction({
                action: 'tap', x: 937, y: 1695
            });
        }
    }

    numericKeyboardDone() {
        if (global.env == 'ios') {
            browser.$(XPATH_KEYBOARD_DONE).click();
        } else {
            // Note: Do not use touch specific location, because we want to make sure the button is "Next" or "Done".
            // browser.touchAction({
            //     action: 'tap', x: 937, y: 1695
            // });
            browser.execute('mobile: performEditorAction', { "action": "Done" });
        }
    }

    keyboardDone() {
        if (global.env == 'ios') {
                browser.$(XPATH_KEYBOARD_DONE).click();
        } else {
            // Note: Do not use touch specific location, because we want to make sure the button is "Next" or "Done".
            // browser.touchAction({
            //     action: 'tap', x: 937, y: 1695
            // });
            browser.execute('mobile: performEditorAction', { "action": "Done" });
        }
    }
 
    execute(command) {
        const exec = require('child_process').exec
    
        exec(command, (err, stdout, stderr) => {
            process.stdout.write(stdout)
        });
    }

    executeSync(command) {
        const execSync = require('child_process').execSync
        console.log("Info: Execute command: " + command);
        execSync(command, (err, stdout, stderr) => {
            process.stdout.write(stdout)
        });

    }

    searchAndSelectInList(element, list_item) {
        while (true) {
          for (const item of $$(element)) {
            const listText = item.getText();
            if (item.isDisplayed() && listText.includes(list_item)) {
              item.click();
              return;
            }   
          }
          utilActions.scrollDown();
        }
    }

    cleanupChromeBrowser(){
        let strCommand = 'adb -s '+ browser.capabilities.deviceName + ' shell am force-stop com.android.chrome';
        this.execute(strCommand);
    }

    resetChromeBrowser(){
        let strCommand = 'adb -s '+ browser.capabilities.deviceName + ' shell am force-stop com.android.chrome';
        this.executeSync(strCommand);
        let strClearChromeCommand = 'adb -s '+ browser.capabilities.deviceName + ' shell pm clear com.android.chrome';
        this.executeSync(strClearChromeCommand);
        //Below is to get pass Get Started screen of Chrome
        let strSetChromeDebugCommand = `adb -s `+ browser.capabilities.deviceName + ' shell am set-debug-app --persistent com.android.chrome';
        this.executeSync(strSetChromeDebugCommand);
        let strResetChromeCommand = `adb -s `+ browser.capabilities.deviceName + ` shell 'echo "chrome --disable-fre --no-default-browser-check --no-first-run --ignore-certificate-errors --ignore-urlfetcher-cert-requests" > /data/local/tmp/chrome-command-line'`;
        this.executeSync(strResetChromeCommand);
    }

    cleanupAndroidEmulatorImages(){
            let strClearImagesCommand = 'adb -s '+ browser.capabilities.deviceName + ' shell rm -rf /sdcard/Pictures';
            this.execute(strClearImagesCommand);
    }

    cleanupGBoardAppData(){
        if (global.env == 'android') {
            let strCommand = 'adb -s ' + browser.capabilities.deviceName + ' shell pm clear com.google.android.inputmethod.latin';
            this.execute(strCommand);
        }
    }

    swipeDownOnePage () {
        if (global.env == 'ios') {
            browser.execute("mobile:swipe", { "direction": "down" });
        } else if (global.env == 'android') {
            browser.touchPerform([{
                action: 'press',
                options: { x: 100, y: 300 },
            }, {
                action: 'wait',
                options: { ms: 300 },
            }, {
                action: 'moveTo',
                options: { x: 100, y: 800 },
            }, {
                action: 'release',
            }]);
        }
    }

    swipeUpOnePage () {
        if (global.env == 'ios') {
            browser.execute("mobile:swipe", { "direction": "up" });
        } else if (global.env == 'android') {
            browser.touchPerform([{
                action: 'press',
                options: { x: 100, y: 800 },
            }, {
                action: 'wait',
                options: { ms: 300 },
            }, {
                action: 'moveTo',
                options: { x: 100, y: 300 },
            }, {
                action: 'release',
            }]);
        }
    }

    swipeUntilScreenBoundary (topOrBottomBoundary, pageobjectName) {
        const swipeOnePage = (topOrBottomBoundary === 'bottom') ? this.swipeUpOnePage : this.swipeDownOnePage;
        const getBoundaryElement = commandHelper("getVisualCheckScreenBoundaryElements", pageobjectName);
        const screenBoundaryElement = getBoundaryElement()[topOrBottomBoundary];
        let locationOriginal = $(selectorHelper(`${pageobjectName}.${screenBoundaryElement}`)).getLocation();
        let locationAfterSwipe = locationOriginal;
        do {
            locationOriginal = locationAfterSwipe;
            swipeOnePage();
            locationAfterSwipe = $(selectorHelper(`${pageobjectName}.${screenBoundaryElement}`)).getLocation();
        }
        while ( locationOriginal['y'] !== locationAfterSwipe['y'] );
    }

    deepCloneObject(target) {
        return JSON.parse(JSON.stringify(target));
    };

}

module.exports = new Helpers();