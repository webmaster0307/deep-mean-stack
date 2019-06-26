'use strict';

/**
 * Module dependencies.
 */
var segmentsPolicy = require('../policies/segments.server.policy'),
  segments = require('../controllers/segments.server.controller');

module.exports = function (app) {
  // Segments collection routes
  app.route('/api/applications/:applicationId/segments').all(segmentsPolicy.isAllowed)
    .get(segments.list)
    .post(segments.create);

  // Single segment routes
  app.route('/api/applications/:applicationId/segments/:segmentId').all(segmentsPolicy.isAllowed)
    .get(segments.read)
    .put(segments.update)
    .delete(segments.delete);

  app.param('segmentId', segments.segmentByID);
};
