'use strict';

/**
 * Module dependencies.
 */
var campaignSchedulePolicy = require('../policies/campaignSchedule.server.policy'),
  campaignSchedule = require('../controllers/campaignSchedule.server.controller');

module.exports = function (app) {

  // Single application routes
  app.route('/api/applications/:applicationId/campaigns/:campaignId/schedule').all(campaignSchedulePolicy.isAllowed)
    .put(campaignSchedule.save)
    .delete(campaignSchedule.delete);
};
