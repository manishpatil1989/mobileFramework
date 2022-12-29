const selectorHelper =  require('paragon-libs').helpers.selectorHelper;

function expectElementTextToEndWith(elementType, element, falseCase, endsWithText) {
    const command = (elementType === 'element') ? 'getText' : 'getValue';
    const elementLocated = selectorHelper(element);
    let elementText = $(elementLocated)[command]();
    //On some screen, getText() gets '', has to use getValue() to get again
    if(global.env == 'ios' && elementText == ''){
        elementText = $(elementLocated).getValue();
    }
    falseCase ? expect(elementText).to.not.satisfy(msg => msg.endsWith(endsWithText), `expect element[${element}]'s text "${elementText}"  not to end with "${endsWithText}"`) : 
                expect(elementText).to.satisfy(msg => msg.endsWith(endsWithText), `expect element[${element}]'s text "${elementText}" to end with "${endsWithText}"`);

}



module.exports =  {
    expectElementTextToEndWith
}