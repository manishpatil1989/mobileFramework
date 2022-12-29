Feature: 1.1 Test feature

    As a Sapient QA, 
    I want to test Demo app
    Background:
        Given I load the testdata for "loginData"


    @sanity
    @android
    Scenario: Validate UI
        When I execute example custom step definition
        Then I expect that element "@home.endUserLicenceLbl" is visible
        Then I expect that element "@home.endUserLicenceLbl" matches the text "End user Licence"
        Then I expect that element "@home.t&CText" is visible
        Then I expect that element "@home.acceptCTA" is visible
        Then I expect that element "@home.refuseCTA" is visible
        When I click on the element "@home.acceptCTA"
        Then I expect that element "@home.testAppLbl" is visible
        Then I expect that element "@home.bookingLbl" is visible
        When I click on the element "@home.logInCTA"
        Then I expect that element "@home.logInLbl" is visible
        Then I set testdata value "username" from file "loginData" on inputfield "@home.usernameInput"
        Then I expect that element "@home.pinLbl" is visible
        Then I set testdata value "password" from file "loginData" on inputfield "@home.passwordInput"
        Then I pause for 4000ms
        When I click on the element "@home.loginBtn"

    @sanity
    @iOS
    Scenario: Validate UI
        When I set "standard_user" to the inputfield "@home.usernameInput"
        When I set "secret_sauce" to the inputfield "@home.passwordInput"
        When I click on the element "@home.loginButton"
        Then I expect that element "@home.productsLabel" is visible

