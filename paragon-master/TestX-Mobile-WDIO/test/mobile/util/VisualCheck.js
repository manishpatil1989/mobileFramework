const fs = require('fs');
const mergeImg = require('merge-img');
const actions = require('paragon-libs').actions;
const commandHelper = require('paragon-libs').helpers.commandHelper;
const selectorHelper = require('paragon-libs').helpers.selectorHelper;
const constants = require('./VisualCheckDeviceBlockoutConstants');
class VisualCheck {

    static performVisualCheck(baselineScreenName, pageobjectName) {
        let compareScreenOptionObject = null;
        compareScreenOptionObject = (global.env === 'ios')? this.deepCloneObject(constants.IOS_COMPARE_SCREEN_DEFAULT_OPTION) : this.deepCloneObject(constants.ANDROID_COMPARE_SCREEN_DEFAULT_OPTION);
        const getBlockOutElements = commandHelper("getVisualCheckBlockOutElements", pageobjectName);
        if (getBlockOutElements instanceof Function) {
            const VCBlockOutElements = getBlockOutElements();
            for (const element of VCBlockOutElements.blockOutElements) {
                if ( $(selectorHelper(`${pageobjectName}.${element}`)).isDisplayed() ) {
                const blockoutElement = selectorHelper(`${pageobjectName}.${element}`);
                compareScreenOptionObject.elementBlockOuts.push({element: $(blockoutElement)});
                }
            }
        }
        const getBlockOutAreas = commandHelper("getVisualCheckBlockOutAreas", pageobjectName);
        if (getBlockOutAreas instanceof Function) {
            const VCBlockOutAreas = getBlockOutAreas();
            for (const element of VCBlockOutAreas.blockOutAreas) {
                (global.env === 'ios')? compareScreenOptionObject.blockOuts.push(element.IOS) : compareScreenOptionObject.blockOuts.push(element.ANDROID);
            }
        }     

        return browser.compareScreen(baselineScreenName,compareScreenOptionObject);
    }

    static getVisualCheckDiffPreview(visualCheckResult) {
        const visualCheckResultDiffPath = visualCheckResult.folders.diff+'/'+visualCheckResult.fileName;
        const visualCheckResultBaselinePath = visualCheckResult.folders.baseline+'/'+visualCheckResult.fileName;
        const visualCheckResultActualPath = visualCheckResult.folders.actual+'/'+visualCheckResult.fileName;
        const visualCheckResultDiffPreviewPath = visualCheckResult.folders.diff+'/preview_'+visualCheckResult.fileName;

        if (fs.existsSync(visualCheckResultDiffPreviewPath)) {
            fs.unlinkSync(visualCheckResultDiffPreviewPath);
          }

        mergeImg([visualCheckResultDiffPath,visualCheckResultBaselinePath,visualCheckResultActualPath])
        .then(img => (img.scale(0.5).write(visualCheckResultDiffPreviewPath,() => console.log('Visual Check diff preview file saved to: ' + visualCheckResultDiffPreviewPath))));
        while (!fs.existsSync(visualCheckResultDiffPreviewPath)) {
            actions.pause(1000);
        }
        return visualCheckResultDiffPreviewPath;
    }

    static deepCloneObject(target) {
        return JSON.parse(JSON.stringify(target));
    };
}

module.exports = VisualCheck;