var chai = require('chai'),
    chaiWrapper = require('paragon-libs').helpers.pageWrapper,
    expect = chai.expect,
    utilChecks = require('../util/checks.js'),
    actions = require('paragon-libs').actions;

chai.use(chaiWrapper);


const dismissCameraModalIfPresentedOnIOS = function() {
    const btnHome                = "@home.homebutton";
    const cameraNotAvailableBody = "@modal.cameraNotAvailableBody";
    const btnOKOnModal           = "@modal.btnOK";
    const visibleButton = utilChecks.waitForAnyVisible(
            [btnHome, cameraNotAvailableBody]);

    if (visibleButton === cameraNotAvailableBody) {
        actions.clickElement("click", "element", btnOKOnModal);
    }
}


module.exports = {
    elements: {
        ios: {
            'usernameInput'             : '~test-Username',
            'passwordInput'             : '~test-Password',
            'loginButton'               : '~test-LOGIN',
            'productsLabel'             : '//XCUIElementTypeStaticText[@name="PRODUCTS"]',
        },

        android: {

            'endUserLicenceLbl'         : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/enfuserlicence")',
            'acceptCTA'                 : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/accept")',
            'refuseCTA'                 : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/btnrefuse")',
            't&CText'                   : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView2")',
            'testAppLbl'                : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView4")',
            'bookingLbl'                : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView")',
            'logInCTA'                  : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/ecLoginButton")',
            'singleBookingRefCTA'       : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/nonECLoginButton',
            'nextFlightLbl'             : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView3")',
            'bookFlightCTA'             : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/flightButton")',
            'logInLbl'                  : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView6")',
            'usernameInput'             : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/username")',
            'pinLbl'                    : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/textView7")',
            'passwordInput'             : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/password")',
            'loginBtn'                  : 'android=new UiSelector().resourceId("com.pcloudy.appiumdemo:id/loginbtn")',


    },
    commands: {
        isPageLoaded: function () {
            expect('@home.usernameInput').to.be.present;
            expect('@home.loginButton').to.be.visible;
        
        },
        }
    },
};
