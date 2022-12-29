# Introduction

This is a webdriverIO Cucumber based test automation framework for mobile apps that provides a standard mechanism for the configuration & running of test suites. This document will help in the framework setup and give a high level understanding of each components and features.


## Key features
* Parallel Execution
* Visual Regression
* Allure reporting
* CI/CD support


## Prerequisites

You'll need to install:

* Node.js (14.18.3 - stable and recommended)
* XCode (13.2 - stable and recommended)
* Android Studio (Bumblebee - stable and recommended)
* Gulp - on your command line execute 
    `npm i -g gulp`
* Appium - on your command line execute (
    `npm i -g appium`
* Appium Doctor - on your command line execute
    `npm i -g appium-doctor`

Note: In case of permission denied error, please try with `sudo`  or else fix ownership of usr/lib/local drive by typing following command:
    `sudo chown -R $USER /usr/local/lib`

* Homebrew from command line (for mac users)
    $ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
* Install carthage using homebrew (for mac users)
    brew install carthage
* Install JQuery using homebrew (for mac users)
    brew install jq
    
* Link carthage if not already linked (for mac users)
    Brew link Carthage
    

## Setup environment variable

Open your terminal and type `open -e ~/.bash_profile` . 
if file not availble, create one using `touch ~/.bash_profile`

Edit your bash profile file with following environment variables enteries (please ensure details are specific to your machine)
* export ANDROID_HOME="/Users/<username>/Library/Android/sdk"
* export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home"
* Append to your PATH variable with `${ANDROID_HOME}/emulator:${ANDROID_HOME}/tools:$ANDROID_HOME/platform-tools:${ANDROID_HOME}/build-tools/29.0.0-rc2:${JAVA_HOME}/bin`

Close the terminal and restart terminal again, verify your env path by typing following commands
* echo $JAVA_HOME 
* echo $ANDROID_HOME

These commands should return path to corresponding sdks

## Create Virtual Devices

Create virtual devices with same specifications as mentioned in "deviceInfo_Default" in device config file for both android and iOS

Note: The device should be created from same configurations and same name as specified in config


## appium-doctor verification

Open your terminal and run command `appium-doctor`.

* please ensure all necessary dependencies are ticked marked and fix any crosses dependencies. 

Now you're ready to get started!


## Framework clone

Create a new folder on your machine then clone the framework repository:
    git clone https://pscode.lioncloud.net/psinnersource/quality-engineering/mobile/paragon.git
    
Now run `npm i` to install node modules

## Command line

You're now ready to run your first test. Type the following command:

for iOS
`gulp test:ios --ff "<featureFile name>" --tags "<tags>"`

for Android
`gulp test:android --ff "<featureFile name>" --tags "<tags>"`

Note : This command will run the tests on default device
       Tests can be run on specific emulator/simulator as well using below command,
       `gulp test:<channel> --ff "<featureFile name>" --tags "<tags>" --deviceInfo "<deviceName>`
       

## More CLI switches

* --reporter.noVideo            &emsp; # disable video recording
* --reporter.screenshot         &emsp; # take screenshot upon failure
* --reporter.pageSource         &emsp; # dump DMA page source upon failure
* --reporter.debug              &emsp; # combination of "--reporter.screenshot" and "--reporter.pageSource"
* --reporter.alwaysShowTraffic  &emsp; # (must be used with "--proxy") always show http traffic in test report even if test case passes
* --filter.specTags             &emsp; # filter out feature files which do not match specified tags in advance
* --um.skipReg                  &emsp; # skip user registration (onboarding) during login (assuming correct user has been registered already)
* --visualCheck.enabled         &emsp; # enable validation on visualCheck test steps. If not specified and tags does not contain @visualCheck, default to disable visualCheck validation. If not specified but tags contains @visualCheck, default to enable visualCheck validation.
* --ignoreDevice             &emsp; # Ignore existing open device being in use OR already open.
* --parallel.factor <Number_of_devices>  &emsp; # Run the parallel devices for multiple feature files. (Number of devices - Max 4 at a time)


## Configuration

All of the configuration for paragon is contained within the <android/ios>.appium.conf.js file

## Managing test data

All test data should be put under the sub-folders as per the envrionment inside data folder in JSON format

## Managing Data Locators

Android and iOS Data locators should be present in pageobjects folder, in .js files

## Managing Custom Functions

Any additional step definitions can be added in stepDefinitions folder custom.js file

## Reporters

Allure report can be accessed using below commands after execution,
gulp get:allure-report-<android/ios>

## Visual Regression

Use the below step to compare current screen with a baseline version screenshot saved in VisualRegression folder

        Then I compare screen "@screen" with "<screen name>" baseline
        

## Parallel Execution

For parallel execution, refer to config --> parallel --> <channel>.parallelCapabilities_max file, and create devices mentioned in the file
Execution command: gulp test:ios-parallel --tags "@sapient and @sanity and @iOS" -–wt "45000" --retries 1 --parallel.factor 3

where, parallel factor count represents the number of devices on which we want to run the suite parallely. This will automatically divide the feature files into number of suites equal to the parallel factor count. 


## FAQ

* **Issue with Xcode**

    $ xcrun simctl list | grep com.apple.CoreSimulator.SimRuntime.iOS | grep -vi Unavailable | awk '{print $2}'
    $ sudo xcode-select -s /Applications/Xcode.app
    
* **Issue with execution getting stuck**

    $ sudo killall -9 node
    
* **Issue with wdio-native-app-compare**

    $ npm install wdio-native-app-compare-service --save-dev
    
* **Issue with Canvas**

    brew install pkg-config cairo pango libpng jpeg giflib librsvg
    npm install canvas
    
* **Uninstall and Re - install specific node module (example appium)**

    npm uninstall -g appium
    npm install -g appium@1.22.2
    
* **To delete all node modules**

    Rm -r node_modules
    
* **NVM reference doc**

    https://blog.logrocket.com/how-switch-node-js-versions-nvm/

