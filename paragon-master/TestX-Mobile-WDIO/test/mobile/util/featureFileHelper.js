let featureFilePath = [],featureFiles;

/**
 * Feature file helper, provides the ability to specify specs to be executed from CLI.
 * @param {String} features - feature files from command line
 */
module.exports = function (features) {
    if(features.includes(',')) {
        featureFiles = features.split(',');
        featureFiles.forEach(featureFile => {
        featureFilePath.push(`test/mobile/features/featureFiles/**/${featureFile.trim()}.feature`)
        })
      } else {
        featureFiles = process.env.ff == 'undefined' ? `test/mobile/features/featureFiles/**/*.feature` : `test/mobile/features/featureFiles/**/${features}.feature`;
        featureFilePath.push(featureFiles);
      }
    return featureFilePath;
};