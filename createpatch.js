var program = require('commander');
var dircompare = require('dir-compare');
var fs = require('fs-extra');
var prettyjson = require('prettyjson');
var path = require('path');
var moment = require('moment');
var Promise = require('bluebird');

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source folder')
  .option('-t --target [target]', 'Target folder')
  .option('-c --changes [changes]', 'JSON of Changes')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

if (!program.target) {
  console.error('no target folder');
  process.exit(1);
}

if (!program.changes) {
  console.error('no changes folder');
  process.exit(1);
}

function copyFiles(params) {
  return new Promise(function(resolve, reject) {
    fs.copy(params.source, params.target, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(params);
      }
    });
  });
}

function readChangesJSON(params) {
  return new Promise(function(resolve, reject) {
    fs.readJson(params.changes, function(error, json) {
      if (error) {
        reject(error);
      } else {
        params.json = json;
        resolve(params);
      }
    });
  });
}

function clearUnneededFiles(params) {
  return new Promise(function(resolve, reject) {

    var files = params.json.equal.filter(function(item) {
      return !item.isDirectory;
    });
    var folders = params.json.equal.filter(function(item) {
      return item.isDirectory;
    });
    folders = folders.sort(function(entry1, entry2) {
      return entry1.path.split(path.sep).length <=
        entry2.path.split(path.sep).length;
    });

    var toBeDeleted = files.concat(folders);

    toBeDeleted.forEach(function(entry) {
      var filePath = path.normalize(params.target + entry.path);

      if (entry.isDirectory) {
        fs.rmdir(filePath, function(error) {
          if (error) {
            console.log('FOLDER NOT FOUND OR NOT EMPTY: ' +
              filePath);
          } else {
            console.log('FOLDER DELETED: ' + filePath);
          }
        });
      } else {
        fs.unlink(filePath, function(error) {
          if (error) {
            console.log('FILE NOT FOUND: ' + filePath);
          } else {
            console.log('FILE DELETED: ' + filePath);
          }
        });
      }
    });
  });
}

copyFiles(program)
  .then(readChangesJSON)
  .then(clearUnneededFiles)
  .catch(console.error);
