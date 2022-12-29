## Test configuration

Test configuration is specified within your <suite>.appium.conf.js file (<suite> = iOS or Android), and in split into 5 sections:

* specs
* capabilities
* services
* reporterOptions
* cucumberOpts

you would need to update only capabilities configuration for deviceName, platform version and application name. Here is an example configuration for iOS and Android capabilities:

# iOS

capabilities: [
      {
        appiumVersion: '1.22.2',
        automationName: 'XCUITest',
        platformName: 'iOS',
        platformVersion: '15.2', -`Update for iOS version`
        deviceName: 'iPhone 13', - `Update for iOS device`
        startIWDP: true,
        noReset: true,
        orientation: 'PORTRAIT',
        maxInstances: 1,
        nativeInstrumentsLib: true,
        app: join(process.cwd(), './apps/ios/TestApp.app'), - `Update for iOS application name`
        connectHardwareKeyboard: false,
        clearSystemFiles: true

    }

# Android 

capabilities: [
    {
      appiumVersion: '1.22.2',
      platformName: "Android",
      platformVersion: "Q", - `Update for Android OS version`
      deviceName: "Pixel_2_API_29", - `Update for Android device name`
      avd: "Pixel_2_API_29",
      orientation: 'PORTRAIT',
      maxInstances: 1,
      app: join(process.cwd(), './apps/android/TestApp.apk'), - `Update for android application`
      appWaitDuration: '10000',
      dontStopAppOnReset: false,
      show_on_first_run_allowed : false,
      show_welcome_page: false,
      autoGrantPermissions: true,
      appActivity: '.ui.PreLoginActivity', - `get details from Developer for android app`
      appWaitActivity: `get details from Developer`
      LandingActivity', - `get details from Developer`
      noSign: true,
  }