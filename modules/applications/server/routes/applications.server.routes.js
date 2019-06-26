'use strict';

/**
 * Module dependencies.
 */
var applicationsPolicy = require('../policies/applications.server.policy'),
  applications = require('../controllers/applications.server.controller');

module.exports = function (app) {
  // Applications collection routes
  app.route('/api/applications').all(applicationsPolicy.isAllowed)
    .get(applications.list)
    .post(applications.create);

  // Single application routes
  app.route('/api/applications/:applicationId').all(applicationsPolicy.isAllowed)
    .get(applications.read)
    .put(applications.update)
    .delete(applications.delete);

  // pem file upload
  app.route('/api/applications/:applicationId/pem').all(applicationsPolicy.isAllowed)
    .post(applications.uploadPem);

  // Finish by binding the application middleware
  app.param('applicationId', applications.applicationByID);
};
