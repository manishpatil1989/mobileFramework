import { Given, When, Then, After, Status } from "@cucumber/cucumber";
const checks = require("paragon-libs").checks,
  actions = require("paragon-libs").actions,
  selectorHelper = require("paragon-libs").helpers.selectorHelper,
  libs = require("paragon-libs").lib,
  utilChecks = require("../../util/checks.js");
const blockOut = require("../../visualBaseline/blockouts").blockOutObject;

Then(
  /^I set testdata value "(.*?)" from file "(.*?)" on inputfield "(.*?)"$/,
  (name, file, identifier) => {
    actions.waitForVisible(identifier);
    const field = $(selectorHelper(identifier));
    field.click();
    field.clearValue();
    field.setValue(global.testdata[file][name]);
  }
);

Then(
  /^I select testdata value "(.*?)" from file "(.*?)" on element "(.*?)"$/,
  (name, file, identifier) => {
    identifier = selectorHelper(identifier);
    browser.selectByVisibleText(identifier, global.testdata[file][name]);
  }
);

Then(
  /^I expect that element "([^"]*)?" does( not)* appear exactly "([^"]*)?" times$/,
  libs.checkIfElementExists
);

Then(/^I execute "([^"]*)?" on the page "([^"]*)?"$/, (command, page) => {
  actions.executeCommand(command, page);
});

Then(
  /^I compare (screen|element) "([^"]*)?" with "([^"]*)?" baseline$/,
  checks.compareBaselineScreenshot
);

Then(
  /^I compare (screen|element) "([^"]*)?" with "([^"]*)?" baseline keeping blockout "([^"]*)?"$/,
  (type, element, name, blockOutInfoKey) => {
    const blockOutObject = blockOut.getblockOut(blockOutInfoKey);
    checks.compareBaselineScreenshotwithBlockOut(
      type,
      element,
      name,
      blockOutObject
    );
  }
);

Then(
  /^I expect that element "([^"]*)?" is( not)* visible$/,
  (element, isDisplayed) => {
    checks.isDisplayed(element, isDisplayed);
  }
);

Then(
  /^I expect that element "([^"]*)?" becomes( not)* visible$/,
  utilChecks.waitForVisible
);

Then(
  /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be visible|contain a text|contain a value|exist))*$/,
  {
    wrapperOptions: {
      retry: 3,
    },
  },
  actions.waitFor
);

Then(
  /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
  checks.checkWithinViewport
);

Then(/^I expect that element "([^"]*)?" does( not)* exist$/, checks.isExisting);

Then(
  /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
  checks.compareText
);

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  (elementType, element, falseCase, expectedTextwithoutFilter) => {
    var expectedText = expectedTextwithoutFilter
      .replace("\\r", "\r")
      .replace("\\n", "\n");
    utilChecks.waitForVisible(element);
    checks.checkEqualsText(elementType, element, falseCase, expectedText);
  }
);

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* matches testdata value "(.*?)" from file "(.*?)"$/,
  (elementType, identifier, falseCase, name, file) => {
    const expectedText = global.testdata[file][name];
    utilChecks.waitForVisible(identifier);
    identifier = selectorHelper(identifier);
    checks.checkEqualsText(elementType, identifier, falseCase, expectedText);
  }
);

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* contains testdata value "(.*?)" from file "(.*?)"$/,
  (elementType, identifier, falseCase, name, file) => {
    utilChecks.waitForVisible(identifier);
    identifier = selectorHelper(identifier);
    const expectedText = global.testdata[file][name];
    checks.checkContainsText(elementType, identifier, falseCase, expectedText);
  }
);

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  (elementType, element, isContaining, expectedText) => {
    utilChecks.waitForVisible(element);
    checks.checkContainsText(elementType, element, isContaining, expectedText);
  }
);

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* contains any text$/,
  checks.checkContainsAnyText
);

Then(
  /^I expect that (button|element) "([^"]*)?" is( not)* empty$/,
  checks.checkIsEmpty
);

Then(
  /^I expect that checkbox "([^"]*)?" is( not)* checked$/,
  checks.checkSelected
);

Then(
  /^I expect that element "([^"]*)?" is( not)* selected$/,
  checks.checkSelected
);

Then(/^I expect that element "([^"]*)?" is( not)* enabled$/, checks.isEnabled);

Then(
  /^I expect that element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  checks.checkDimension
);

Then(
  /^I expect that element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
  checks.checkOffset
);

Then(/^I expect that element "([^"]*)?" is( not)* focused$/, checks.checkFocus);

Then(
  /^I expect that a (alertbox|confirmbox|prompt) is( not)* opened$/,
  checks.checkModal
);

Then(
  /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
  checks.checkModalText
);
