function parseOneFeatureLine(oneFeatureFileLine) {
    oneFeatureFileLine = oneFeatureFileLine.trim();
    const [fileName, lineNumberString] = oneFeatureFileLine.split(":");
    return { fileName: 'test/mobile/features/featureFiles/' + fileName, lineNumbers: lineNumberString.split(" ") };
}

function parse(lineNumberedTestParameters, origFeatureFilePath) {
    if (lineNumberedTestParameters) {
        const cucumberFeaturesWithLineNumbers = [];
        const specFilaNames = [];
        [].concat(lineNumberedTestParameters).forEach(l => {
            const { fileName, lineNumbers } = parseOneFeatureLine(l);
            specFilaNames.push(fileName);
            lineNumbers.forEach(
                lineNumber => cucumberFeaturesWithLineNumbers.push(fileName + ":" + lineNumber));
        }
        );

        return [cucumberFeaturesWithLineNumbers, specFilaNames];
    } else {
        return [[], origFeatureFilePath];
    }

}

module.exports = { parse }
