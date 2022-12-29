import { Given, When, Then, After, Status } from "@cucumber/cucumber";
const checks = require("paragon-libs").checks;
const Helpers = require("../../util/Helpers.js");

Given(/^I load the testdata for "([^"]*)?"$/, function (datafile) {
  global.testdata = global.testdata || {};
  global.testdata[datafile] = require("../../data/" +
    global.datafilePath +
    "/" +
    datafile +
    ".json");
});

Given(/^the element "([^"]*)?" is( not)* enabled$/, checks.isEnabled);

Given(/^I skip the test$/, function () {
  return "skipped";
});

Given(/^the element "([^"]*)?" is( not)* selected$/, checks.checkSelected);

Given(/^the checkbox "([^"]*)?" is( not)* checked$/, checks.checkSelected);

Given(
  /^there is (an|no) element "([^"]*)?" on the page$/,
  checks.checkElementExists
);

Given(
  /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
  checks.compareText
);

Given(
  /^the (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  checks.checkEqualsText
);

Given(
  /^the (button|element) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  checks.checkContainsText
);

Given(
  /^the (button|element) "([^"]*)?"( not)* contains any text$/,
  checks.checkContainsAnyText
);

Given(/^the (button|element) "([^"]*)?" is( not)* empty$/, checks.checkIsEmpty);

Given(
  /^the element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  checks.checkDimension
);

Given(
  /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
  checks.checkOffset
);

Given(/^a (alertbox|confirmbox|prompt) is( not)* opened$/, checks.checkModal);

Given(/^I launch the app$/, function () {
  browser.launch();
});

Given(/^I disable the webview browser$/, function () {
  if (global.env == "android") {
    let strCommand =
      "adb -s " +
      browser.capabilities.deviceName +
      " shell pm disable-user org.chromium.webview_shell";
    Helpers.executeSync(strCommand);
  }
});

Given(/^I close the chrome browser$/, function () {
  if (global.env == "android") {
    Helpers.cleanupChromeBrowser();
  }
});

Given(/^I switch the context to (native|web)$/, function (viewType) {
  let contexts = driver.getContexts();
  console.log("contexts are ", contexts);
  if (viewType === "native") {
    driver.switchContext(contexts[0]);
  } else if (viewType === "web") {
    driver.switchContext(contexts[1]);
  }
});