const utilChecks = require('./checks.js');
const actions = require('paragon-libs').actions;
const gestures = require('paragon-libs').gestures;
const selectorHelper = require('paragon-libs').helpers.selectorHelper;
const reporter = require('@wdio/allure-reporter').default;

/**
 * 
 * @param {array} selectors Array of selector of elements
 * @param {int} ms timeout 
 * 
 */
function clickWhichEverButtonIsPresented(selectors, ms) {
    const visibleButton = utilChecks.waitForAnyVisible(
        selectors, ms);

    actions.clickElement("click", "element", visibleButton);

    return visibleButton;
}

function clickButtonAndOptionalAlertBeforeThat(mainButton, ...optionalAlertButtons) {
    const clickedButton = clickWhichEverButtonIsPresented(
        [mainButton, ...optionalAlertButtons], 30000);

    if (clickedButton !== mainButton) {
        utilChecks.waitForVisible(mainButton);
        actions.clickElement("click", "element", mainButton);
    }
}

function _scrollDown() {
    if (global.env == 'ios') {
        
        browser.execute('mobile: swipe', {
            direction: 'up',
        }); 
    } else if (global.env == 'android') {
        
        browser.touchPerform([{
            action: 'press',
            options: { x: 200, y: 1000 },
        }, {
            action: 'wait',
            options: { ms: 200 },
        }, {
            action: 'moveTo',
            options: { x: 200, y: 500 },
        }, {
            action: 'release',
        }]);
    }
}

function _slowScrollDown() {
    if (global.env == 'ios') {
        
        browser.execute('mobile: swipe', {
            direction: 'up',
        }); 
    } else if (global.env == 'android') {
        
        browser.touchPerform([{
            action: 'press',
            options: { x: 200, y: 600 },
        }, {
            action: 'wait',
            options: { ms: 200 },
        }, {
            action: 'moveTo',
            options: { x: 200, y: 500 },
        }, {
            action: 'release',
        }]);
    }
}

function _swipeDown() {
    if (global.env == 'ios') {
        
        browser.execute('mobile: swipe', {
           direction: 'up',
        });

    } else if (global.env == 'android') {
        
        browser.touchPerform([{
            action: 'press',
            options: { x: 497, y: 1398 },
        }, {
            action: 'wait',
            options: { ms: 200 },
        }, {
            action: 'moveTo',
            options: { x: 441, y: 164 },
        }, {
            action: 'release',
        }]);
    }
}

/**
 * 
 * Function: scrolling right on "Favorites" part to find specific element, (nearly 1/3 top of the screen)
 * 
 */
function _scrollRightOnTop() {
    if (global.env == 'ios') {
        browser.execute('mobile:dragFromToForDuration',
        {
            duration: '2.0',
            fromX: '200',
            fromY: '200',
            toX: '10',
            toY: '200'
        }, );

    } else if(global.env == 'android') {

        browser.touchPerform([{
            action: 'press',
            options: { x: 300, y: 350 },
        }, {
            action: 'wait',
            options: { ms: 200 },
        }, {
            action: 'moveTo',
            options: { x: 80, y: 350 },
        }, {
            action: 'release',
        }]);
    }
}

function doUntil(action, condition, timeOutAndMessage = {
    timeout: global.waitForTime,
    timeoutMsg: `condition ${condition} still not got met after ${global.waitForTime}ms`
}) {
    
    let caughtSentinel = null;
    browser.waitUntil(() => {
        utilChecks.SENTINELS_TO_ABORT_TESTS.forEach(_ => {
            if (utilChecks.isDisplayed(_.selector)) {
                caughtSentinel = _;
            }
        });

        if (caughtSentinel) {
            return true;
        }

        if (condition()) {
            return true;
        }

        action();

        return false;
    }, {
        timeout: timeOutAndMessage.timeout,
        timeoutMsg: timeOutAndMessage.timeoutMsg
    });


    if (caughtSentinel) {
        reporter.addDescription(caughtSentinel.errorTitle);
        throw new Error(caughtSentinel.errorDetails);
    }
}
/*
    Set the given date while onboarding
    The date should be in formate dd/mmmm/yyyy, Ex. '01/January/1999' 
*/
function _setDateOfBirth(dateOfBirth) {
    var day = dateOfBirth.split("/")[0];
    var month = dateOfBirth.split("/")[1];
    var year = dateOfBirth.split("/")[2];
    console.log("day : " + day + " month : " + month + " year : " + year);
    actions.clickElement('click', 'element', '@personalDetails.dobFrame');
    if (global.env == 'ios') {
        actions.waitForVisible('@personalDetails.monthPickerWheel');
        $(selectorHelper('@personalDetails.monthPickerWheel')).addValue(month);
        $(selectorHelper('@personalDetails.dayPickerWheel')).addValue(day);
        $(selectorHelper('@personalDetails.yearPickerWheel')).addValue(year);
    } else if (global.env == 'android') {
        actions.waitForVisible('@personalDetails.dobHeaderYearPicker');
        actions.clickElement('click', 'element', '@personalDetails.dobHeaderYearPicker');

        var found = false;
        do {
            for (const e of $$("//android.widget.TextView[@resource-id='android:id/text1']")) {
                if (e.getText() == year) {
                    e.click();
                    found = true;
                    break;
                }
            }
            gestures.swipeByCords('', '540', '540', '650', '1000');
        } while (!found);

        do {
            try {
                $("//android.view.View[@content-desc=\"" + day + " " + month + " " + year + "\"]").click();
                break;
            } catch (err) {
                $("//android.widget.ImageButton[@content-desc=\"Next month\"]").click();
                found = false;
            }
        } while (!found);
        $('//android.widget.Button[@resource-id="android:id/button1"]').click();
    }
}

function setInputField(method, value, element) {
    actions.waitForVisible(element);
    const field = $(selectorHelper(element));
    field.click();
    field.clearValue();
    field.setValue(value);
}

function _setExpiryDate(txtexpiryDate, field) {
    actions.waitForVisible(field);
    actions.clickElement("click", "element", field);
    field = selectorHelper(field);
    if (global.env == 'ios') {
        $(field).setValue(txtexpiryDate);
    } else {
        txtexpiryDate.split('').forEach(digit => {
            driver.pressKeyCode(+7 + parseInt(digit))
        });
    }
}

/**
 * 
 * @param {function} condition stop scrolling down as soon as the condtion is true
 * 
 */
function scrollDownUntil(condition, timeOutAndMessage = {
    timeout: global.waitForTime,
    timeoutMsg: `condition ${condition} still not got met after ${global.waitForTime}ms`
}) {
    return doUntil(_scrollDown, condition, timeOutAndMessage);
}

function _slowScrollDownUntil(condition) {
    doUntil(_slowScrollDown, condition);
}

function _swipeDownUntil(condition) {
    doUntil(_swipeDown, condition);
}

/**
 * 
 * @param {function} condition stop scrolling right as soon as the condtion is true
 * 
 */
function _swipeRightOnTopUntil(condition) {
    doUntil(_scrollRightOnTop, condition);
}

/**
 * 
 * Function: wait for Element to be visible, then click on it.
 * @param {element} Element
 * 
 */
function clickElement(element) {
    const elementFound = utilChecks.waitForAnyVisibleReturnObject([element]).elementFound;
    
    if (global.env == 'ios') {
        // For some reason, click/tap deos not take effect 
        // on certain elements/pages if we use a more "direct"
        // way as with Android
        // So we keep the "old" way
        elementFound.waitForEnabled(global.waitForTime);
        actions.clickElement("click", "element", element);
    } else {
        // use a more "direct" way to click on element itself on Android
        // See more at PBI 728455
        elementFound.click();
    }
}

module.exports = {
    clickWhichEverButtonIsPresented,
    clickButtonAndOptionalAlertBeforeThat,
    scrollDownUntil,
    slowScrollDownUntil: _slowScrollDownUntil,
    swipeDownUntil: _swipeDownUntil,
    swipeRightOnTopUntil: _swipeRightOnTopUntil,
    setDateOfBirth: _setDateOfBirth,
    setExpiryDate: _setExpiryDate,
    scrollDown: _scrollDown,
    clickElement,
    setInputField
}