'use strict';

var chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  PNotification = mongoose.model('Notification'),
  config = require(path.resolve('./config/config')),
  _ = require('lodash'),
  Promise = require('bluebird'),
  appUserLib = require(path.resolve('./modules/analytics/server/libs/appUser.server.lib')),
  resque = require('coffee-resque').connect(config.redis);

mongoose.Promise = Promise;

exports.send = function(application, campaign) {
  // TODO: check preferences
  console.log('Storing notifications into queue');

  return appUserLib.getAppUsersBySegment(application, campaign.segment)
  .then(function(appUsers){
    _.each(appUsers, function(user) {
      // do not create notification if pushNotificationEnabled = false
      if (!user.userDevice.pushNotificationEnabled) return;

      var notification = new PNotification();
      notification.campaign = campaign;
      notification.appUser = user;
      notification.application = application._id;
      notification.save(function(err, newNotification){
        if (err) {
          console.log(err);
        } else {
          console.log('queuing new notification ' + newNotification.id);
          // schedule notification on redis
          resque.enqueue('push_notifications', 'send', [newNotification.id], function(err, remainingJobs) {
            console.log('New job queued. Remaining jobs in queue: ' + remainingJobs);
          });
        }
      });
    });
  });
};
