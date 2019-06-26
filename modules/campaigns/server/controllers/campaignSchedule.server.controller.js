'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  crontab = require('node-crontab'),
  _ = require('lodash'),
  chalk = require('chalk'),
  CampaignSchedule = mongoose.model('CampaignSchedule'),
  scheduler = require('../libs/scheduler.server.lib'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * saves campaign schedule
 */
exports.save = function (req, res) {
  var jsonObj = _.pick(req.body, 'repeat', 'sendDate', 'timeZone', 'status', 'frequency');
  var campaignSchedule;
  if (req.campaign.deliverySchedule) {
    campaignSchedule = _.extend(req.campaign.deliverySchedule, jsonObj);
  } else {
    campaignSchedule = new CampaignSchedule(jsonObj);
    campaignSchedule.campaign = req.campaign._id;
    req.campaign.deliverySchedule = campaignSchedule;
  }

  var promise;
  if (req.campaign.isActive && !req.campaign.isPaused) {
    promise = scheduler.scheduleNotifications(req.campaign, req.application);
    req.campaign.status = 'ACTIVE';
  } else {
    promise = campaignSchedule.save();
  }

  promise.then(function() {
    return req.campaign.save();
  }).then(function() {
    res.json(campaignSchedule);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete schedule associated to campaign
 */
exports.delete = function (req, res) {
  var campaignSchedule = req.campaign.deliverySchedule;
  if (campaignSchedule) {
    // unschedule if any job is scheduled
    scheduler.cancelJob(CampaignSchedule);

    campaignSchedule.remove(function(err){
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        delete req.campaign.deliverySchedule;
        req.campaign.status = 'PAUSED';
        req.campaign.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json({ success: true });
          }
        });
      }
    });
  }
};
