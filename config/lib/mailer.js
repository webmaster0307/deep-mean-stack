'use strict';

var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var config = require('../config');
var Promise = require('bluebird');

var transporter = nodemailer.createTransport(ses({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
}));

exports.sendMail = function(params) { // to, subject, text
  params.from = params.from || config.email.from;
  return new Promise(function(resolve, reject) {
    transporter.sendMail(params, function(err, info) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};
