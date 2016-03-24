var program = require('commander');
var dircompare = require('dir-compare');
var fs = require('fs-extra');
var prettyjson = require('prettyjson');
var path = require('path');

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source folder')
  .option('-t --target [target]', 'Target folder to compare with source')
  .option('-g --generate [generate]',
    'The path that the update json will be generated')
  .option('-p --print', 'Printing in console')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

if (!program.generate) {
  console.error('no generate folder');
  process.exit(1);
}

console.log('Source: ' + program.source);
console.log('Target: ' + program.target);
console.log('Generate path: ' + program.generate);
/*
compareSize: true/false - compares files by size
compareContent: true/false - compares files by content
skipSubdirs: true/false - skips sub directories
skipSymlinks: true/false - skips symbolic links
ignoreCase: true/false - ignores case when comparing names.
includeFilter: file name filter
excludeFilter: file/directory name exclude filter
*/

function writeJson() {
  var dir = path.normalize(program.generate + path.sep);
  fs.ensureDir(dir, function(error) {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    fs.writeJson(dir + 'changes.json', result, function(err) {
      if (err) {
        console.error(error);
        process.exit(1);
      }
    });
  });
}

var result = {
  added: [],
  updated: [],
  deleted: [],
  equal: [],
};

if (!program.target || program.target.indexOf('undefined') !== -1) {
  writeJson();
} else {
  var res = dircompare.compareSync(program.source,
    program.target, {
      compareSize: true,
      compareContent: true,
      skipSubdirs: false,
      skipSymlinks: false,
      ignoreCase: false
    });

  var result = {
    added: [],
    updated: [],
    deleted: [],
    equal: [],
  };

  var relations = {
    'right': 'added',
    'distinct': 'updated',
    'left': 'deleted',
    'equal': 'equal'
  };

  res.diffSet.forEach(function(entry) {
    var num = entry.state === 'right' ? '2' : '1';
    result[relations[entry.state]].push({
      path: path.normalize(entry.relativePath + path.sep + entry['name' +
        num]),
      isDirectory: entry['type' + num] === 'directory'
    });
  });

  writeJson();

  if (program.print) {
    var options = {
      noColor: false
    };
    console.log(prettyjson.render(result, options));
  }
}
