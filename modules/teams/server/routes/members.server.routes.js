'use strict';

/**
 * Module dependencies.
 */
var memberPolicy = require('../policies/members.server.policy'),
  teamMembers = require('../controllers/members.server.controller');

module.exports = function (app) {

  app.route('/api/teams/:teamId/members').all(memberPolicy.isAllowed)
    .get(teamMembers.list);

  app.route('/api/teams/:teamId/members/:memberId').all(memberPolicy.isAllowed)
    .put(teamMembers.create)
    .delete(teamMembers.delete);

  // Finish by binding the user middleware
  app.param('memberId', teamMembers.memberByID);

};
