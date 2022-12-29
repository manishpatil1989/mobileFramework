import { Given, When, Then, After, Status } from "@cucumber/cucumber";
import reporter from '@wdio/allure-reporter';

const selectorHelper = require('paragon-libs').helpers.selectorHelper,
    gestures = require('paragon-libs').gestures,
    actions = require('paragon-libs').actions,
    date = require('date-and-time'),
    device = require('../../util/Device'),
    utilActions = require('../../util/actions.js'),
    Helpers = require('../../util/Helpers.js'),
    checks = require('paragon-libs').checks,
    utilChecks = require('../../util/checks.js'),
    Device = require('../../util/Device'),
    utilExpect = require('../../util/expect'),
    argv = require('../../util//argvHandler.js'),
    commandHelper = require('paragon-libs').helpers.commandHelper,
    fs = require('fs'),
    VisualCheck= require('../../util/VisualCheck');

var chai = require('chai');

After((scenario) => {
    if(scenario.result.status === Status.FAILED) {
        if(takesScreenShotUponFailure && !global.failVisualCheckDiffPath){
            browser.takeScreenshot();
        }

        if(global.failVisualCheckDiffPath){
            reporter.addAttachment("Visual Check Screenshots. From Left to Right: Diff | Baseline | Actual", fs.readFileSync(global.failVisualCheckDiffPath), 'image/png');
        }

        if(dumpsDMAPageSource){
            reporter.addAttachment("DMA Page Source", browser.getPageSource());
        }

        if(global.env == 'android'){
            Helpers.cleanupChromeBrowser();
        }
    }
});

Given(/^I dump the page source code$/, function () {
    actions.pause(3000)
    console.log(browser.getPageSource());
});

Given(/^I relaunch the app$/, function () {
    console.log("Info: I relaunch the app");
    Device.restartApp();
});

Given(/^I activate the app$/, function () {
    console.log("Info: I activate the app");
    Device.activateApp();
});

Then(/^I hide numeric keyboard$/, function () {
    if (global.env == 'ios') {
        Helpers.iosAlphaNumericKeyboardDone();
    } else {
        browser.hideKeyboard('pressKey', 'Done');
    }
});

Given(/^I execute example custom step definition$/, function () {
    console.log("This is for fun");
});

Then(/^I uninstall the app on device with appID "([^"]*)?"$/, function (appID) {
    browser.removeApp(appID);
});

Then(/^I hide the keyboard$/, function () {
    browser.hideKeyboard();
});

Then(/^I click keyboard key "(Done|Search|Return)"$/,
function (key) {
    if (key === 'Done') {
        if (global.env == 'ios') {
            browser.$("//XCUIElementTypeKey[@name='Done']").click();
        } else {
            browser.hideKeyboard('pressKey', 'Done');
        }
    } else if (key === 'Search') {
        if (global.env == 'ios') {
            browser.$("//XCUIElementTypeButton[@name='Search']").click();
        } else {
            browser.execute("mobile:performEditorAction", { "action": "search" });
        }
    } if (key == 'Return') {
        browser.hideKeyboard('pressKey', 'return');
    }
});

When(/^I scroll down until element "(.*?)" is visible$/, function (element) {
    utilActions.scrollDownUntil(() => utilChecks.isDisplayed(element),
    {
        timeout: global.waitForTime,
        timeoutMsg: `element ("${selectorHelper(element)}") still not displayed after ${global.waitForTime}ms`
    });
});

When(/^I slowly scroll down until element "(.*?)" is visible$/, function (element) {
    utilActions.slowScrollDownUntil(() => utilChecks.isDisplayed(element));
});

When(/^I add (QR code|barcode) "(.*?)" from file "(.*?)" to simulator$/, function (scanCodeType, name, file) {
    const scanCodeDirName = (scanCodeType === 'QR code') ? 'qrcode' : 'barcode';
    const scanCodeFileName = process.cwd() + '/'+ scanCodeDirName +'/' + global.testdata[file][name];
    console.log("qrcode/barcode image location : " + scanCodeFileName);
    Device.addImageIntoGallery(scanCodeFileName);
});

When(/^I select the (?:QR|barcode) image "(.*?)" from file "(.*?)"$/, function (name, file) {
    var qrcode = global.testdata[file][name];
    console.log("QR code name : " + qrcode);
    actions.pause('2000');
    Device.selectImageFromGallery(qrcode);
});

When(/^I tap on the element "([^"]*)?"$/, function (element) {
        actions.pause("2000");
        $(selectorHelper(element)).touchAction('tap');
});

When(/^I tap on search button$/, function () {
    if (global.env == 'ios') {
        browser.hideKeyboard('pressKey', 'Search');
    }
});

When(/^I swipe down for one page$/, function () {
    Helpers.swipeDownOnePage();
});

Then(/^I compare the text section value "(.*?)" from file "(.*?)" on inputfield "(.*?)"$/,
    (name, file, identifier) => {
        let notesExpected = global.testdata[file][name];
        identifier = selectorHelper(identifier);
        var regex = /\t/g;
        let notesValue = $(identifier).getText();
        console.log("the txt on app is " + notesValue);
        notesValue = notesValue.toString().replace(regex, " ");
        // let notesValue = identifier.getText().replace(regex," ");
        expect(notesExpected).to.equal(notesValue);
    }
);

Then(/^I capture text of the element "(.*?)" and name it "(.*?)"$/,
    (identifier, variableName) => {
        global.captures = global.captures || {};
        identifier = selectorHelper(identifier);
        global.captures[variableName] = $(identifier).getText();
        console.log('All captured variables before ', global.captures);
});

Then(/^I set captured text "(.*?)" on the element "(.*?)"$/,
    (variableName, identifier) => {
        global.captures = global.captures || {};
        identifier = selectorHelper(identifier);
        identifier.setValue(global.captures[variableName]);
        console.log('All captured variables after ', global.captures[variableName]);
    });
Then(/^I normalise captured text "(.*?)" and compare on the element "(.*?)"$/,
    (variableName, identifier) => {
        global.captures = global.captures || {};
        identifier = selectorHelper(identifier);
        var temp = global.captures[variableName];
        var compareText = $(identifier).getText();
        expect(temp).to.equal(compareText);
        console.log('The number to compare is ', temp[0], 'and ', compareText);
});

Then(/^I verify the element "(.*?)" has correct date format "(.*?)"$/,
    (identifier, dateFormat) => {
        identifier = selectorHelper(identifier);
        var temp = $(identifier).getText();
        if (dateFormat.includes("time")) {
            var format = date.isValid(temp, 'D MMM YYYY, HH:mm');
        } else {
            var format = date.isValid(temp, 'D MMM YYYY');
        }
        expect(format).to
            .equal(true, `"${identifier}" should be in correct date format`);
});

Then(/^I wait until the element "([^"]*)?" contains non zero value on iOS$/, (element) => {
    if (global.env == 'ios') {
        var element = $(selectorHelper(element));
        browser.waitUntil(() => {
            return element.getValue() != 0
        }, 5000, 'Error: Expect element to be non zero after 5s');
    }
});

Then(/^I expect that elements "([^"]*)?" matches the text "([^"]*)?"$/,
    (element, text) => {
        var element = selectorHelper(element);
        const elements = browser.$$(element);
        console.log(elements);
        for (var i = 0; i < elements.length; i++) {
            var comparetext = (elements[i]).getText();
            console.log(comparetext);
            if (text == comparetext[i]) {
                expect(text).to.equal(comparetext[i]);
            }
            break;
        };
});

Then(/^I verify the element "([^"]*)?" does not contains any special character$/,
    function (element) {
        var element = selectorHelper(element);
        var text = $(element).getText();
        var spclChar = ['^', '@', '(', ')', '#', '$', ':', ';', '$'];
        spclChar.forEach(function (item) {
            console.log("item print", item);
            console.log(expect(text).to.not.contain(item));
        })
});

Then(/^I verify the ios element "([^"]*)?" are sorted in "([^"]*)?" order$/,
    function (element, sortorder) {
        const elements = browser.$$(element);
        for (var i = 0; i < elements.length; i++) {
            var amount = (elements[i]).getText();
            console.log(amount);
            var res = amount.substring(text.length - 3, text.length - 2);
            console.log('The string compared is', res);
            expect(res).to.equal(".");
        };
        var len = arr.length - 1;
        for (var i = 0; i < len; ++i) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }
        return true;
});

Then(/^I hide device keyboard/, function () {
    const input = $('.input');
    input.setValue(['Command', 'k']);
});

When(/^I scroll down till element "(.*?)" is enabled$/, function (element) {
    if (!$(selectorHelper(element)).isEnabled()) {
        do {
            if (global.env == 'ios') {
                browser.execute("mobile:swipe", { "direction": "up" });
            } else if (global.env == 'android') {
                browser.touchPerform([{
                    action: 'press',
                    options: { x: 200, y: 1000 },
                }, {
                    action: 'wait',
                    options: { ms: 200 },
                }, {
                    action: 'moveTo',
                    options: { x: 200, y: 0 },
                }, {
                    action: 'release',
                }]);
            }
        } while (!$(selectorHelper(element)).isEnabled());
    }
});

When(/^I scroll down to make "(.*?)" visible$/, function (element) {
    if (!$(selectorHelper(element)).isDisplayed()) {
        do {
            if (global.env == 'ios') {
                gestures.swipeByCords(selectorHelper(element), '170', '170', '210', '50');
            } else if (global.env == 'android') {
                browser.touchPerform([{
                    action: 'press',
                    options: { x: 200, y: 1000 },
                }, {
                    action: 'wait',
                    options: { ms: 200 },
                }, {
                    action: 'moveTo',
                    options: { x: 200, y: 800 },
                }, {
                    action: 'release',
                }]);
            }
        } while (!$(selectorHelper(element)).isDisplayed());
    }
});

When(/^I scroll up to make "(.*?)" visible$/, function (element) {
    if (!$(selectorHelper(element)).isDisplayed()) {
        do {
            if (global.env == 'ios') {
                gestures.swipeByCords(selectorHelper(element), 170, 170, 400, 600);
            } else if (global.env == 'android') {
                browser.touchPerform([{
                    action: 'press',
                    options: { x: 200, y: 800 },
                }, {
                    action: 'wait',
                    options: { ms: 200 },
                }, {
                    action: 'moveTo',
                    options: { x: 200, y: 1000 },
                }, {
                    action: 'release',
                }]);
            }
        } while (!$(selectorHelper(element)).isDisplayed());
    }
});

Then(/^I verify the element "([^"]*)?" does not contains "([^"]*)?" text$/,
    function (element, inputText) {
        var element = selectorHelper(element);
        var text = $(element).getText();
        expect(text).to.not.contain(inputText);
});

Given(/^I launch the app$/, function () {
    browser.launchApp();
});

Then(/^I hide keyboard$/,
    function () {
        if (global.env == 'ios') {
            Helpers.iosAlphaNumericKeyboardDone();
        } else {
            browser.hideKeyboard('pressKey', 'Done');
        }
});

When(/I refresh the page source$/, function () {
            driver.getPageSource();
});
