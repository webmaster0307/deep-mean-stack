'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

mongoose.Promise = require('bluebird');

/**
 * Update App User fields
 */
exports.update = function(req, res) {
  var appUserJson = _.pick(req.body, 'preferences', 'uuid');
  var currentAppUser = _.extend(req.appUser, appUserJson);
  currentAppUser.save()
  .then(function(){
    res.json(currentAppUser);
  })
  .catch(function(err){
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Update User Device
 */
exports.updateUserDevice = function (req, res) {
  var userDevice;
  var application = req.decoded;
  var currentAppUser = req.appUser;

  Promise.resolve()
  .then(function() {
    var userDeviceData;
    if (currentAppUser.userDevice) {
      userDeviceData = _.extend(currentAppUser.userDevice.toObject(), req.body);
    } else {
      userDeviceData = req.body;
    }
    userDeviceData = _.omit(userDeviceData, '_id', '__v', 'created');
    userDevice = new UserDevice(userDeviceData);
    userDevice.appUser = currentAppUser._id;
    return userDevice.save();
  })
  .then(function() {
    currentAppUser.userDevice = userDevice._id;
    currentAppUser.save();
  })
  .then(function() {
    res.json(userDevice);
  })
  .catch(function(err){
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

// app user middleware
exports.appUserById = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'App User Id is invalid'
    });
  }

  AppUser.findById(id).populate('userDevice').exec(function (err, appUser) {
    if (err) {
      return next(err);
    } else if (!appUser) {
      return res.status(404).send({
        message: 'No app user with that identifier has been found'
      });
    }
    req.appUser = appUser;
    next();
  });
};
