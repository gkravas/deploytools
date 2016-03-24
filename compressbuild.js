var program = require('commander');
var fs = require('fs');
var archiver = require('archiver');
var path = require('path');
var zlib = require('zlib');

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source folder')
  .option('-t --target [target]', 'Target file path with path included')
  .option('-c --compress', 'Full compression')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

if (!program.target) {
  console.error('no target folder');
  process.exit(1);
}

console.log('Source: ' + program.source);
console.log('Target: ' + program.target);

var output = fs.createWriteStream(path.normalize(program.target));
var archive = archiver('zip', {
  zlib: {
    level: program.compress ? zlib.Z_BEST_COMPRESSION : zlib.Z_NO_COMPRESSION
  }
});

output.on('close', function() {
  console.log('Complete zip: ' + program.target);
  console.log(archive.pointer() + ' total bytes');
});

archive.on('error', function(error) {
  console.error(error);
});

archive.pipe(output);

archive.bulk([
  {
    expand: true,
    cwd: path.normalize(program.source),
    src: ['**/*']
  }
]);

console.log('Compressing: ' + program.source);
archive.finalize();
