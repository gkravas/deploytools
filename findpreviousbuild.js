var program = require('commander');
var dircompare = require('dir-compare');
var fs = require('fs-extra');
var prettyjson = require('prettyjson');
var path = require('path');
var moment = require('moment');
var os = require('os');

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source folder')
  .option('-a --append [append]', 'File to append')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

if (!program.append) {
  console.error('no file to append results');
  process.exit(1);
}

console.log('Source: ' + program.source);

function getDirectories(params) {
  return new Promise(function(resolve, reject) {
    var folders = fs.readdirSync(params.source).filter(function(file) {
      return fs.statSync(path.join(params.source, file)).isDirectory();
    });

    var folders = folders.sort(function(folder1, folder2) {
      var folder1Parts = folder1.split('_');
      var folder2Parts = folder2.split('_');

      var result = true;
      folder1Parts.forEach(function(folder1Part, index) {
        if (folder1Part < folder2Parts.index) {
          result = false;
          return;
        }
      });
      return result;
    });

    console.log('Previous version: ' + folders[0]);
    params.previousVersion = folders[0];
    resolve(params);
  });
}

function readFile(params) {
  return new Promise(function(resolve, reject) {
    fs.readFile(params.append, function(error, content) {
      if (error) {
        reject(error);
      } else {
        params.content = content;
        resolve(params);
      }
    });
  });
}

function appendToFile(params) {
  params.content += os.EOL + 'PREVIOUS_VERSION: ' + params.previousVersion;
  return new Promise(function(resolve, reject) {
    fs.outputFile(params.append, params.content, function(error) {
      if (error) {
        reject(error);
      } else {
        resolve({});
      }
    });
  });
}

getDirectories(program)
  .then(readFile)
  .then(appendToFile)
  .catch(console.error);
