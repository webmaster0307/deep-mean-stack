var mongooseLib = require('./config/lib/mongoose');
var mongoose = require('mongoose');
var _ = require('lodash');
var fs = require('fs');
var FCM = require('fcm-push');
var apn = require('apn');
var Promise = require('bluebird');
var chalk = require('chalk');
var config = require('./config/config');
var resque = require('coffee-resque').connect(config.redis);

mongooseLib.loadModels();
mongooseLib.connect(function (db) {
  console.log('connected to db');
});

var resqueJobs = {
  send: function(notificationId, callback) {
    var Notification = mongoose.model('Notification');
    Notification.findById(notificationId)
    .populate([{
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
    }]).exec()
    .then(function(notification) {
      if (!notification) {
        console.log(notification, notificationId);
        throw new Error('Notification not found');
      }

      var campaign = notification.campaign;
      if (campaign.animation) {
        campaign.animation.expiresAt = campaign.animation.duration * campaign.loopCount + (campaign.loopCount - 1) * campaign.loopDelay;
      }
      var msgData = _.pick(campaign, 'animation', 'message', 'messagePosition', 'url', 'campaignType', 'loopDelay', 'loopCount');

      // supplying display type (nova, supernova, dpi...)
      var platformIndex = _.findIndex(campaign.platform, { name: notification.appUser.userDevice.devicePlatform.toLowerCase() });
      if (platformIndex > -1) {
        msgData.displayType = campaign.platform[platformIndex].displayType;
      }

      msgData._id = notification._id;

      switch (notification.appUser.userDevice.devicePlatform) {
        case 'Android':
          {
            var androidMessage = {
              to: notification.appUser.userDevice.deviceToken,
              collapse_key: notification.campaign._id, // we use campagin id as collapse key
              // priority: 'high',
              // contentAvailable: true,
              // delayWhileIdle: true,
              // timeToLive: 3,
              data: msgData
            };
            console.log('sending Android', JSON.stringify(androidMessage));
            if (!campaign.application.fcmServerKey) {
              throw new Error('FCM Server Key not found');
            }

            var fcm = new FCM(campaign.application.fcmServerKey);
            return fcm.send(androidMessage).then(function(response) {
              notification.status = 2;
              console.log(chalk.green('Successfully sent!'));
              console.log(response);
              return notification.save();
            }).catch(function(err) {
              notification.status = 1;
              console.log(chalk.red('Something has gone wrong on sending PN!'));
              console.log(err);
              return notification.save();
            });
          }
          break;
        case 'iOS':
          {
            var keyPem = campaign.application.keyPem;
            var certPem = campaign.application.certPem;
            if (!keyPem || !certPem) {
              throw new Error('Key Pem or Cert Pem not found!')
            }
            var keyBuffer = Buffer.from(keyPem, 'utf8');
            var certBuffer = Buffer.from(certPem, 'utf8');
            var provider = new apn.Provider({
              cert: certBuffer,
              key: keyBuffer
            });
            var iOSNotification = new apn.Notification();
            iOSNotification.sound = 'ping.aiff';
            iOSNotification.alert = 'notification from dynamic push'; // @TODO change it to config or db
            iOSNotification.payload = msgData;
            console.log('sending iOS', JSON.stringify(iOSNotification));
            return provider.send(iOSNotification, notification.appUser.userDevice.deviceToken)
              .then(function(response) {
                notification.status = 2;
                console.log(chalk.green('Successfully sent!'));
                console.log(response);
                return notification.save();
              })
              .catch(function(err) {
                notification.status = 1;
                console.log(chalk.red('Something has gone wrong on sending PN!'));
                console.log(err);
                return notification.save();
              });
          }
          break;
      }
    })
    .then(function() {
      callback('success!');
    })
    .catch(function(err) {
      callback(err);
    });
  }
};

// setup a worker
var worker = resque.worker('push_notifications', resqueJobs);

// some global event listeners
//
// Triggered every time the Worker polls.
worker.on('poll', function(worker, queue) {
});

// Triggered before a Job is attempted.
worker.on('job', function(worker, queue, job) {
  console.log(chalk.green('a job is going to run'));
});

// Triggered every time a Job errors.
worker.on('error', function(err, worker, queue, job) {
  console.log(chalk.red('There was problem sending a push notification'));
  console.log(err);
});

// Triggered on every successful Job run.
worker.on('success', function(worker, queue, job, result) {
  console.log(chalk.green('Push notification has been sent'));
});

worker.start();
