"use strict";
const getSpecsFilterByTag = require('./spec.filter.by.tags.js').getSpecsFilterByTag;
class FeatureFilesDistributor {
  constructor(parallelFactor, featureFileFolder, tag) {
    this.parallelFactor = parallelFactor;
    this.featureFileFolder = featureFileFolder;
    this.tag = tag;
  }
    /**
    * distribute feauture files according to the parallelFactor
    */
  distributeFeatureFiles() {
    
    const newSpecs = getSpecsFilterByTag(this.featureFileFolder , this.tag);
    return this._splitFeatureFilesByParallelFactor(newSpecs, this.parallelFactor);
  }

  _splitFeatureFilesByParallelFactor(specs, parallelFactor) {
    const featureFilesCount = specs.length;
    const suiteSize = Math.round(featureFilesCount/parallelFactor);
    let suiteConfig = {
      "suites": {
      }
    }
    for(let i = 0; i < parallelFactor; i++){
      let suite = [];
      const suiteNumber = i+1;
      const suiteNumberKey = 'suite'+suiteNumber;
      if (i == (parallelFactor-1)) {
        suite = specs.slice(i*suiteSize);
      } else {
        suite = specs.slice(i*suiteSize, (i+1)*suiteSize);
      }
      suiteConfig.suites[suiteNumberKey] = suite;
    }
    return suiteConfig;
  }
}

module.exports = function(parallelFactor, featureFileFolder, tag) {
	return new FeatureFilesDistributor(parallelFactor, featureFileFolder, tag);
};