const selectorHelper =  require('paragon-libs').helpers.selectorHelper;
const reporter = require('@wdio/allure-reporter').default,
actions = require('paragon-libs').actions;


const SENTINEL_UNABLE_TO_PROCEED = {
    selector: "@modal.unableToProceedTitle",
    errorTitle: 'Unable to proceed',
    errorDetails: "Seen Unable to Proceed page - the Test Environment might have issues"
}

const APP_CRASH_TITLE = {
    selector: "@appCrash.title",
    errorTitle: "App Crashes",
    errorDetails: "BualuangM has stopped"
}

const APP_KEEPS_CRASHING_TITLE = {
    selector: "@appCrash.keepsCrashingTitle",
    errorTitle: "App Crashes",
    errorDetails: "BualuangM keeps stopping"
}

const APP_NOT_RESPONDING = {
    selector: "@appCrash.appNotRespondingTitle",
    errorTitle: "App isn't responding",
    errorDetails: "App isn't responding"
}

const GBOARD_HAS_STOPPED = {
    selector: "@appCrash.gboardHasStoppedTitle",
    errorTitle: "Gboard has stopped",
    errorDetails: "Gboard has stopped"
}

const SERVICE_UNAVAILABLE = {
    selector: "@serviceUnavailablePopup.txtTitle",
    errorTitle: "Service unavailable",
    errorDetails: "Service unavailable"
}

const NETWORK_ISSUE = {
  selector: "@networkIssuePopup.txtBody",
  errorTitle: "Network issue",
  errorDetails: "You do not have network connectivity. Please check your connection and try again."
}

const IOS_SENTINELS = [];
const ANDROID_SENTINELS = [];

const SENTINELS_TO_ABORT_TESTS = (global.env === 'ios') ? IOS_SENTINELS : ANDROID_SENTINELS;


/**
 * Get a waiter with which all kinds of wait operations could be performed on element selectors
 * 
 * @param {int} ms timeout time for wait operation
 * @param {sentinelSelector} wait operation will be aborted once the sentinel selector is detected unexpectedly.
 * Such as unexpected Unable To Proceed page title which indicates something is wrong with the test env.
 * 
 * @returns the waiter
 */
function getWaiter({
    ms = global.waitForTime,
    sentinels: sentinels = []
}) {
    return new Waiter(ms, ...sentinels);
}

/**
 * Waiter object is used to perform all kinds of wait operations performed on element selectors
 * 
 */

class Waiter {
    /**
     * @param {int} ms timeout time for wait operation
     * @param {sentinelSelector} wait operation will be aborted once the sentinel selector is detected unexpectedly.
     */
    constructor(ms, ...sentinels) {
        this.ms = ms;
        this.sentinels = sentinels
    }

    /**
     * wait until any of the specified selectors is displayed, or
     * sentinel selector is displayed unexpcted.
     * 
     * @param {Array.<String>} ...selectors expected to be displayed
     * 
     * @returns 
     *   { selectorFound: selectorFound,
     *     elementFound: elementFound
     *   } an object of selector and WDIO element found
     * 
     * @throws Error if sentinel selector is displayed unexpcted
     */
    waitForAnyVisbile(...selectors) {
        this.sentinels.forEach(_ => selectors.push(_.selector));

        const selectorsAndNativeLocators = selectors.map( selector => {
            const nativeLocator = selectorHelper(selector);
            return `${selector}(${nativeLocator})`;
        });

        let selectorFound = undefined;
        let elementFound = undefined;
        browser.waitUntil(function () {
            return selectors.some(
                (selector) => {
                    elementFound = $(selectorHelper(selector));
                    selectorFound = selector;
                    return elementFound.isDisplayed();
                }
            );
        }, {
            timeout: this.ms,
            timeoutMsg: `elements ("${selectorsAndNativeLocators}") still not displayed after ${this.ms}ms`
        });

        this.sentinels.forEach(_ => {
            if (_.selector === selectorFound) {
                reporter.addDescription(_.errorTitle);
                throw new Error(_.errorDetails);
            }
        });

        return {
            selectorFound: selectorFound,
            elementFound: elementFound
        };
    }
}


/**
 * 
 * @param {array} selectors Array of selector of elements (not including "Unable to proceed" ID )
 * @param {int} ms timeout 
 * 
 * @returns {string} the selector of the fisrt visible element
 */
function waitForAnyVisible(selectors, ms = global.waitForTime) {
    return waitForAnyVisibleReturnObject(selectors, ms).selectorFound;
}

/**
 * 
 * @param {array} selectors Array of selector of elements (not including "Unable to proceed" ID )
 * @param {int} ms timeout 
 * 
 * @returns 
 * {
 *       selectorFound: selectorFound, // the paragon selector of element found
 *       elementFound: elementFound    // the wdio/appium handle of the element found
 * } 
 * Unable to Proceed Test Env issue is handeld as well.
 */
function waitForAnyVisibleReturnObject(selectors, ms = global.waitForTime) {
    return getWaiter({sentinels: SENTINELS_TO_ABORT_TESTS, ms: ms }).waitForAnyVisbile(...selectors);
}

/**
 * 
 * @param {array} selectors Array of selector of elements (including "Unable to proceed" ID )
 * @param {int} ms timeout 
 * 
 * @returns {string} the selector of any element visible
 *
 */
function waitForAnyElementVisible(selectors, ms = global.waitForTime) {
    return getWaiter({sentinels: SENTINELS_TO_ABORT_TESTS.filter(_ => _ !== SENTINEL_UNABLE_TO_PROCEED), ms: ms})
        .waitForAnyVisbile(...selectors).selectorFound;
}

function elemBelongsToUnableToProceedPage(elem) {
    const UTP_PAGES = ['fullScreenError'];

    return UTP_PAGES.some( page => {
        return elem.startsWith(`@${page}.`);
    });
}

/**
 * Wait for the given element to become visible
 * @param  {String}   elem      Element selector
 * @param  {String}   falseCase Whether or not to expect a visible or hidden
 *                              state
 * 
 * Unable to Proceed Test Env issue is handeld as well.
 */
function waitForVisible(elem, falseCase) {
    if (!!falseCase) {
        actions.waitForVisible(elem, falseCase);
    } else {
        if (elemBelongsToUnableToProceedPage(elem)) {
            waitForAnyElementVisible([elem])
        } else {
            waitForAnyVisible([elem]);
        }
    }
}

/**
 * 
 * @param {selector} selector selector for the element
 * 
 */
function isEnabled(selector) {
    return $(selectorHelper(selector)).isEnabled();
}

/**
 * 
 * @param {selector} selector selector for the element
 * 
 */
function isDisplayed(selector) {
    return $(selectorHelper(selector)).isDisplayed();
}

module.exports =  {
    waitForAnyVisible,
    waitForAnyVisibleReturnObject,
    waitForAnyElementVisible,
    waitForVisible,
    isEnabled,
    isDisplayed,
    SENTINELS_TO_ABORT_TESTS
}