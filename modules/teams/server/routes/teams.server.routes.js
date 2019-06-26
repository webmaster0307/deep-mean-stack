'use strict';

/**
 * Module dependencies.
 */
var teamPolicy = require('../policies/team.server.policy'),
  team = require('../controllers/teams.server.controller');

module.exports = function (app) {

  // Teams collection routes
  app.route('/api/teams').all(teamPolicy.isAllowed)
    .get(team.list)
    .post(team.create);

  // Single team routes
  app.route('/api/teams/:teamId').all(teamPolicy.isAllowed)
    .get(team.read)
    .put(team.update)
    .delete(team.delete);

  // Finish by binding the user middleware
  app.param('teamId', team.teamByID);
};
