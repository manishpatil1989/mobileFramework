"use strict";

const argv = require('yargs').argv;
const fs = require('fs-extra');
const countCaseNumberForFeatureFile = require('./spec.filter.by.tags.js').countCaseNumberForFeatureFile;

const tagExpression = argv._.join(' ');

function countCase(tagExpressionString) {
  const allFeatureFilePath = 'test/mobile/features/featureFiles/**/*.feature';
  const files = require('glob').sync(allFeatureFilePath);
  let count = 0;
  files.forEach( file => {
    const source = fs.readFileSync(file, 'utf8');
    count += countCaseNumberForFeatureFile(file, source, tagExpressionString);
  });
  console.log("test count: " + count);
}

countCase(tagExpression);