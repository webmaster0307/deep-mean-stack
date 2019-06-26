'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  multer = require('multer'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  config = require(path.resolve('./config/config')),
  ImageLib = require(path.resolve('./modules/core/server/libs/images.server.lib')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Uploads animation
 */
exports.uploadImage = function (req, res) {
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, config.uploads.dest);
    },
    filename: function(req, file, cb) {
      cb(null, randomstring.generate(10) + '_' + file.originalname);
    }
  });
  var upload = multer(_.extend(config.uploads, {
    storage: storage
  })).single('image');
  upload(req, res, function(uploadError) {
    if(uploadError) {
      return res.status(400).send({
        message: 'Error occurred while uploading picture'
      });
    } else {
      fs.chmodSync(req.file.path, '0777');
      ImageLib.uploadToAWS(req.file, function(err, image) {
        fs.unlinkSync(req.file.path);
        if (err) {
          return res.status(400).send({
            message: err
          });
        }
        res.json({
          image: image
        });
      }, true);
    }
  });
};
