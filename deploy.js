var program = require('commander');
var request = require('request');

program
  .version('0.0.1')
  .option('-n --versionNumber [version]', 'Version Number to deploy')
  .option('-t --type [type]', 'Type of app to deploy[test|release]')
  .parse(process.argv);

if (!program.versionNumber) {
  console.error('no version');
  process.exit(1);
}

if (!program.type) {
  console.error('no type');
  process.exit(1);
}

if (['test', 'release'].indexOf(program.type) === -1) {
  console.error('no supoorted type[test|release]');
  process.exit(1);
}

function makeCall() {
  // Build the post string from an object
  var postData = {
    projectName: 'theUniversim',
    version: program.versionNumber,
    type: program.type,
    oss: ['win', 'osx', 'linux'],
    hasPatch: true
  };

  request
  .defaults({
    headers: {'Content-Type': 'application/json'}
  })
  .post('http://api.theuniversim.com:1337/version/deploy')
  .form(postData)
  .on('response', function(res) {
    console.log('Completed with status code: ' + res.statusCode);
    if (res.statusCode !== 200) {
      console.error('Request failed');
      process.exit(1);
    }
  });
}
makeCall();
