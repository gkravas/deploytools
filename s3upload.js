var program = require('commander');
var dircompare = require('dir-compare');
var fs = require('fs-extra');
var prettyjson = require('prettyjson');
var path = require('path');
var s3 = require('s3');

program
  .version('0.0.1')
  .option('-s --source [source]', 'Source file')
  .option('-t --target [target]', 'Target key path on s3')
  .option('-b --bucket [bucket]', 'Bucket to upload')
  .option('-d --delete', 'Delete source after success upload')
  .parse(process.argv);

if (!program.source) {
  console.error('no source folder');
  process.exit(1);
}

if (!program.bucket) {
  console.error('no backet selected');
  process.exit(1);
}

if (!program.target) {
  console.error('no target key path for s3');
  process.exit(1);
}

console.log('Source: ' + program.source);
console.log('Bucket: ' + program.bucket);
console.log('Target: ' + program.target);
console.log('Delete Source: ' + program.delete);

var client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: 'YOUR ACCESS KEY ID',
    secretAccessKey: 'YOUR SECRET ACCESS KEY',
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

function writeConfigurationVersion(params) {
  return new Promise(function(resolve, reject) {
    var args = {
      localFile: params.source,

      s3Params: {
        Bucket: params.bucket,
        Key: params.target,
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      },
    };
    console.log('Uploading...');
    var uploader = client.uploadFile(args);

    uploader.on('error', function(error) {
      reject(error);
    });

    uploader.on('progress', function() {

    });

    uploader.on('end', function() {
      console.log('done uploading');
      resolve(params);
    });
  });
}

function deleteSource(params) {
  return new Promise(function(resolve, reject) {
    console.log('Delete: ' + params.delete);
    if (!params.delete) {
      resolve(params);
      return;
    }
    fs.remove(params.source, function(error) {
      if (error) {
        reject(error);
      } else {
        console.log('DELETED: ' + params.source);
        resolve(params);
      }
    });
  });
}

writeConfigurationVersion(program)
  .then(deleteSource)
  .catch(console.error);
