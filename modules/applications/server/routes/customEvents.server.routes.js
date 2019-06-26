'use strict';

/**
 * Module dependencies.
 */
var customEventsPolicy = require('../policies/customEvents.server.policy'),
  customEvents = require('../controllers/customEvents.server.controller');

module.exports = function (app) {
  // customEvents collection routes
  app.route('/api/applications/:applicationId/customEvents').all(customEventsPolicy.isAllowed)
    .get(customEvents.list)
    .post(customEvents.create);

  // Single customEvents routes
  app.route('/api/applications/:applicationId/customEvents/:customEventId').all(customEventsPolicy.isAllowed)
    .get(customEvents.read)
    .put(customEvents.update)
    .delete(customEvents.delete);

  app.param('customEventId', customEvents.customEventByID);
};
