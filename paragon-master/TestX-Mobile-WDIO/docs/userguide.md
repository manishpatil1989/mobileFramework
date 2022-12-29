# Page Object

Page Object consist 2 main parts:

* elements
* some commands

;arranged as so:

module.exports = {
    elements: {
        ios: {
   
            'element1'                  : '~accesibility id',
            'element2'                  : 'xpath1 | xpath2',
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
    },     
};

## Elements

Elements can be defined using a shortcut method - just a string to identify the element.

{
    elements : {
        elementName : "accessability selector"
    }
}

Elements can be accessed within your page object functions by using the argument as
`"@home.endUserLicenceLbl"` command.

You can also access elements defined within your pages from your feature files, for example:

Then I expect that element "@home.messageCenterIcon" is visible

;where the page name (myPage in the example above) is the name of the file your page object is stored within and the elementName is the name of the element defined within that page object.

## Commands

Commands are an array of objects, where the objects contain functions related to the page. Having it as an array allows you easily extend the commands for a page with shared commands:

{
    commands : [
        require('../shared/sharedLoginCommands'),
        {
            isLoaded : function () { .... }
        }
    ]
}

Commands can call other commands on the page object by accessing the command by name on the "this" object:

{
    commands : [
        firstCommand : function () {
            this.secondCommand();
        },
        secondCommand : function () {
            console.log("I am the second command!");
        }
    ]
}

Commands can also be called from you feature files:

The I execute commandName on the page pageName