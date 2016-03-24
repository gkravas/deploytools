var program = require('commander');
var dircompare = require('dir-compare');
var fs = require('fs-extra');
var prettyjson = require('prettyjson');
var path = require('path');
var moment = require('moment');
var Promise = require("bluebird");

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source folder')
  .option('-g --generate', 'If to generate a java configuration')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

var source = path.normalize(program.source + path.sep + 'gameVersion.json');
console.log('Source ' + source);

function readGameVersion(source) {
  return new Promise(function(resolve, reject) {
    fs.readJson(source, function(error, json) {
      if (error) {
        reject(error);
      } else {
        resolve({
          source: source,
          json: JSON.parse(json)
        });
      }
    });
  });
}

function updateGameVersion(params) {
  return new Promise(function(resolve, reject) {
    console.log(params.json);
    params.json.version = params.json.version.replace('*',
      moment().utc(0).format('YYMMDDHHmm'));
    console.log('New version ' + params.json.version);
    fs.writeJson(params.source, JSON.stringify(params.json), function(error) {
      if (error) {
        reject(error);
      } else {
        resolve(params);
      }
    });
  });
}

function writeConfigurationVersion(params) {
  return new Promise(function(resolve, reject) {
    fs.outputFile(source.replace('json', 'txt'),
    'BUILD_VERSION_CLEAN: ' + params.json.version + '\n' +
    'BUILD_VERSION: ' + params.json.version.replace(/\./g, '_'),
      function(error) {
        if (error) {
          reject(error);
        } else {
          resolve({});
        }
      });
  });
}

readGameVersion(source)
  .then(updateGameVersion)
  .then(writeConfigurationVersion)
  .catch(function(error) {
    console.log(error);
    process.exit(1);
  });
