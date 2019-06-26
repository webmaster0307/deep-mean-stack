'use strict';

/**
 * Module dependencies.
 */
var devices = require('../controllers/devices.server.controller');
var appUsers = require('../controllers/appUsers.server.controller');
var events = require('../controllers/events.server.controller');

// @TODO authorize routes

module.exports = function (app) {
  app.route('/api/applications/:applicationId/analytics/devicesByPlatform')
    .get(devices.getDevicesByPlatform);

  app.route('/api/applications/:applicationId/analytics/getAudiences')
    .get(appUsers.getAudiences);

  app.route('/api/applications/:applicationId/analytics/getAudienceCounts')
    .post(appUsers.getAudienceCounts);

  app.route('/api/applications/:applicationId/analytics/getAudienceCountByFilter')
    .post(appUsers.getAudienceCountByFilter);

  app.route('/api/applications/:applicationId/analytics/events')
    .get(events.getEventsAnalyticsBySegment);

  app.route('/api/applications/:applicationId/analytics/dpCount')
    .get(events.getDPCount);
};
