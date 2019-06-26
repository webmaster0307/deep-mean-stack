'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * getDevicesByPlatform
 */
exports.getDevicesByPlatform = function(req, res) {
  AppUser.find({
    application: req.application._id,
    userDevice: { $exists: true }
  }).select(
    'userDevice'
  ).exec()
  .then(function(userDevices) {
    var deviceIds = _.map(userDevices, function(d) { return d.userDevice; });
    return UserDevice.aggregate([
      {
        $match: {
          _id: { $in: deviceIds }
        }
      }, {
        $group: {
          _id: {
            devicePlatform: '$devicePlatform',
            optIn: '$pushNotificationEnabled',
            uninstalled: '$uninstalled'
          },
          deviceCount: { $sum: 1 }
        }
      }, {
        $group: {
          _id: '$_id.devicePlatform',
          devices: {
            $push: {
              optIn: '$_id.optIn',
              uninstalled: '$_id.uninstalled',
              count: '$deviceCount'
            }
          },
          total: { $sum: '$deviceCount' }
        }
      }
    ]).exec();
  })
  .then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};
