'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  PNotification = mongoose.model('Notification'),
  AppUser = mongoose.model('AppUser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

mongoose.Promise = require('bluebird');

/**
 * Return all unread notifications
 */
exports.getUnreadNotifications = function(req, res) {
  var offset = req.query.offset*1 || 0;
  var limit = req.query.limit*1 || 10;
  PNotification.find({
    appUser: req.appUser._id,
    status: 2 // only succesfully sent ones
  }).populate([{
    path: 'appUser',
    populate: [{
      path: 'userDevice'
    }]
  }, {
    path: 'campaign',
    populate: [
      { path: 'application' },
      { path: 'animation' }
    ]
  }]).skip(offset).limit(limit).exec().then(function(notifications) {
    res.json(_.map(notifications, function(notification) {
      var campaign = notification.campaign;
      if (campaign.animation) {
        campaign.animation.expiresAt = campaign.animation.duration * campaign.loopCount + (campaign.loopCount - 1) * campaign.loopDelay;
      }
      var msgData = _.pick(campaign, 'animation', 'message', 'messagePosition', 'url', 'campaignType', 'loopCount', 'loopDelay');

      // supplying display type (nova, supernova, dpi...)
      var platformIndex = _.findIndex(campaign.platform, { name: notification.appUser.userDevice.devicePlatform });
      if (platformIndex > -1) {
        msgData.displayType = campaign.platform[platformIndex].displayType;
      }

      msgData._id = notification._id;

      return msgData;
    }));
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: 'Error while retrieving notifications'
    });
  });
};


exports.setNotificationRead = function(req, res) {
  req.notification.status = 3;
  req.notification.save().then(function(notification) {
    res.json(notification);
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: 'Error while marking notification read'
    });
  });
};

// app user middleware
exports.notificationById = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Notification Id is invalid'
    });
  }

  PNotification.findById(id).exec(function (err, notification) {
    if (err) {
      return next(err);
    } else if (!notification) {
      return res.status(404).send({
        message: 'No notification with that identifier has been found'
      });
    }

    req.notification = notification;
    next();
  });
};
