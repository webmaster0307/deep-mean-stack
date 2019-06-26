'use strict';

/**
 * Module dependencies.
 */
var accessPolicy = require('../policies/access.server.policy'),
  teamAccess = require('../controllers/access.server.controller');

module.exports = function (app) {

  app.route('/api/teams/:teamId/access').all(accessPolicy.isAllowed)
    .get(teamAccess.list)
    .post(teamAccess.create);

  app.route('/api/teams/:teamId/access/:accessId').all(accessPolicy.isAllowed)
    .put(teamAccess.update)
    .delete(teamAccess.delete);

  // Finish by binding the user middleware
  app.param('accessId', teamAccess.accessByID);

};
