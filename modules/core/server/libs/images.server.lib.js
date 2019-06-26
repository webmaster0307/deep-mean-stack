'use strict';

var path = require('path'),
  AWS = require('aws-sdk'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  _ = require('lodash'),
  ImageModel = mongoose.model('Image'),
  config = require(path.resolve('./config/config')),
  gifyParse = require('gify-parse'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.uploadToAWS = function(imgObj, cb, staticImg) {
  var buffer = fs.readFileSync(imgObj.path);
  var gifInfo = gifyParse.getInfo(buffer);
  AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  });
  // For now let's accept only gif files and no resizing
  if ((gifInfo.valid && !staticImg) || staticImg) {
    var duration = gifInfo.duration;
    if (!duration && gifInfo.isBrowserDuration && gifInfo.durationChrome) {
      duration = gifInfo.durationChrome;
    }
    if (!duration && !staticImg) {
      cb('Can not get duration of the gif.', null);
    } else {
      // upload to amazon
      var s3Bucket = new AWS.S3({
        params: {
          Bucket: config.aws.bucket
        }
      });
      var params = {
        Body: fs.createReadStream(imgObj.path),
        ACL: 'public-read',
        ContentType: imgObj.mimetype,
        Key: 'campaigns/' + imgObj.filename
      };
      s3Bucket.putObject(params, function(err, data){
        if (!staticImg) {
          var imageJson = {
            url: 'https://s3.amazonaws.com/' + config.aws.bucket + '/' + params.Key,
            type: imgObj.mimetype,
            size: imgObj.size,
            duration: duration || 0
          };
          var image = new ImageModel(imageJson);
          image.save(function (err) {
            if (err) {
              cb(err, null);
            } else {
              cb(null, image);
            }
          });
        } else {
          cb(null, 'https://s3.amazonaws.com/' + config.aws.bucket + '/' + params.Key);
        }
      });
    }
  } else {
    cb('Image is not valid gif.', null);
  }
};
