import { Given, When, Then, After, Status } from "@cucumber/cucumber";
const actions = require("paragon-libs").actions,
  gestures = require("paragon-libs").gestures,
  selectorHelper = require("paragon-libs").helpers.selectorHelper,
  utilActions = require("../../util/actions.js");

When(
  /^I (click|doubleclick|aspclick) on the (link|button|element) "([^"]*)?"$/,
  function (action, type, element) {
    utilActions.clickElement(element);
  }
);

When(
  /^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/,
  actions.setInputField
);

When(/^I clear the inputfield "([^"]*)?"$/, actions.clearInputField);

When(/^I submit the form "([^"]*)?"$/, actions.submitForm);

When(/^I pause for (\d+)ms$/, actions.pause);

When(/^I press "([^"]*)?"$/, actions.pressButton);

When(
  /^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/,
  actions.handleModal
);

When(/^I enter "([^"]*)?" into the prompt$/, actions.setPromptText);

When(/^I scroll to element "([^"]*)?"$/, actions.scroll);

When(/^I scroll down for one page$/, function () {
  browser.execute("mobile:scroll", { direction: "down" });
});

When(
  /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
  actions.selectOptionByIndex
);

When(
  /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
  actions.selectOption
);

When(
  /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
  actions.moveToElement
);

When(
  /^I swipe the carousel "([^"]*)?" from right to left$/,
  gestures.swipeLeft
);

When(
  /^I swipe the carousel "([^"]*)?" from left to right$/,
  gestures.swipeRight
);

When(/^I swipe the carousel "([^"]*)?" from bottom to top$/, gestures.swipeUp);

When(
  /^I swipe the carousel "([^"]*)?" from top to bottom$/,
  gestures.swipeDown
);

When(
  /^I swipe the element "([^"]*)?" by cordinates Xcords (\d+),(\d+) Ycords (\d+),(\d+)$/,
  gestures.swipeByCords
);

When(
  /^I tap on screen by cordinates X "([^"]*)?" and Y "([^"]*)?"$/,
  function (x, y) {
    browser.touchAction({
      action: "tap",
      x: x,
      y: y,
    });
  }
);

When(
  /^I save (screen|element) "([^"]*)?" as "([^"]*)?" screenshot$/,
  actions.saveVisualComparisonScreenshot
);

When(/^I tap on the element "([^"]*)?"$/, function (element) {
  actions.pause("2000");
  $(selectorHelper(element)).touchAction("tap");
});
