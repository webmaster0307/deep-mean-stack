'use strict';

/**
 * Module dependencies.
 */
var filtersPolicy = require('../policies/filters.server.policy'),
  filters = require('../controllers/filters.server.controller');

module.exports = function (app) {
  // Segments collection routes
  app.route('/api/applications/:applicationId/filters').all(filtersPolicy.isAllowed)
    .get(filters.list)
    .post(filters.create);

  // Single segment routes
  app.route('/api/applications/:applicationId/filters/:filterId').all(filtersPolicy.isAllowed)
    .get(filters.read)
    .put(filters.update)
    .delete(filters.delete);

  app.param('filterId', filters.filterByID);
};
