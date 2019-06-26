'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  config = require(path.resolve('./config/config')),
  md5 = require('md5'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash'),
  AppUser = mongoose.model('AppUser'),
  Application = mongoose.model('Application'),
  twilio = require('twilio')(config.twilio.sID, config.twilio.token),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mailer = require(path.resolve('./config/lib/mailer')),
  Promise = require('bluebird');

mongoose.Promise = Promise;

/**
 * Register App User
 */
exports.authenticate = function (req, res) {
  var uuid = req.body.uuid;
  var newAppUser = new AppUser({
    uuid: uuid,
    verified: true
  });
  var currentApplication;

  Application.findOne({
    apiKey: req.body.apiKey,
    apiSecret: req.body.apiSecret
  })
  .lean()
  .exec()
  .then(function(application){
    if (application === null) {
      throw {
        message: 'Application not found'
      };
    }
    currentApplication = application;
    return AppUser.findOne({
      uuid: uuid,
      application: application._id
    });
  })
  .then(function(appUser){
    if (appUser === null) {
      newAppUser.application = currentApplication._id;
      return newAppUser.save();
    } else {
      return Promise.resolve(appUser);
    }
  })
  .then(function(currentAppUser){
    // Removing verification feature
    // if (!currentAppUser.verified) {
    //   res.status(403).send({
    //     message: 'Your account is not verified yet. Please verify by email or sms.'
    //   });
    //   return;
    // }

    var appJson = _.pick(currentApplication, '_id', 'packageName');
    var token = jwt.sign(appJson, config.mobileSessionSecret, {
      expiresIn: config.mobileTokenExpire * 60
    });
    res.json({
      success: true,
      application: appJson,
      userId: currentAppUser._id,
      token: token
    });
  }).catch(function(err){
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.sendVerifyToken = function(req, res) {
  var appUser = req.appUser;
  appUser.verifyToken = randomstring.generate({ length: 6, charset: 'numeric' });
  appUser.verifyMethod = req.query.verifyMethod;
  appUser.verifyDevice = req.query[req.query.verifyMethod];

  appUser.save().then(function(appUser) {
    if (appUser.verifyMethod === 'email') {
      // email
      return mailer.sendMail({
        to: req.query.email,
        subject: 'Verification Code from Dynamic Push',
        text: 'Verification Code: ' + appUser.verifyToken
      }).then(function() {
        res.send({
          status: 'SUCCESS',
          message: 'Verification code sent to ' + req.query.email + ' as email'
        });
      });
    } else {
      // sms
      var phone = req.query.phone;
      twilio.sendMessage({
        from: config.twilio.from,
        to: phone,
        body: 'DP Verification Code: ' + appUser.verifyToken
      }, function(err, response) {
        if (err) throw err;
        res.send({
          status: 'SUCCESS',
          message: 'Verification code sent to ' + phone + ' as sms message'
        });
      });
    }
  }).catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.verifyToken = function(req, res) {
  if (req.appUser.verifyToken === req.query.verifyToken) {
    req.appUser.verified = true;
    req.appUser.save().then(function() {
      res.send({
        status: 'SUCCESS'
      });
    }).catch(function(err) {
      res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  } else {
    res.status(400).send({
      message: 'Verification code does not match'
    });
  }
};

exports.getAppUserByUUID = function(req, res, next) {
  var id = req.query.uuid;
  if (!id) {
    return res.status(400).send({
      message: 'UUID is invalid'
    });
  }

  AppUser.findOne({ uuid: id }).exec(function (err, appUser) {
    if (err) {
      return next(err);
    } else if (!appUser) {
      return res.status(404).send({
        message: 'No app user with that UUID has been found'
      });
    }
    req.appUser = appUser;
    next();
  });
};

// authentication middleware
exports.applicationByToken = function (req, res, next) {
  var token = req.body.mobileToken || req.query.mobileToken || req.headers.Authorization;

  // decode token
  if (token) {
    jwt.verify(token, config.mobileSessionSecret, function(err, decoded){
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token'
        });
      }else {
        req.decoded = decoded;
        next();
      }
    });
  }else {
    return res.status(403).send({
      success: false,
      message: 'No Token Provided'
    });
  }
};
