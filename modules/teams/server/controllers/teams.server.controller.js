'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Team = mongoose.model('Team'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Returns a Team
 */
exports.read = function (req, res) {
  res.json(req.team);
};

/**
 * Create a Team
 */
exports.create = function (req, res) {
  // Init Variables
  var inputs = _.pick(req.body, 'name', 'description');

  var team = new Team(inputs);
  team.owner = req.user;
  team.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    } else {
      res.json(team);
    }
  });
};

/**
 * Update a Team
 */
exports.update = function (req, res) {
  var team = req.team;

  //For security purposes only merge these parameters
  team.name = req.body.name;
  team.description = req.body.description;
  team.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    } else {
      res.json(team);
    }
  });
};

/**
 * Delete a Team
 */
exports.delete = function (req, res) {
  var team = req.team;

  team.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(team);
  });
};

/**
 * List of Teams
 */
exports.list = function (req, res) {
  Team.find({ owner: req.user }).sort('name').exec(function (err, teams) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(teams);
  });
};

/**
 * TeamId middleware
 */
exports.teamByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Team id is invalid'
    });
  }

  Team.findOne({
    _id: id,
    owner: req.user
  }).populate('members', '-salt -password').populate('access.application', '-apiSecret -apiKey -googleApiKey -senderId').exec(function (err, team) {
    if (err) {
      return next(err);
    } else if (!team) {
      return res.status(403).send({
        message: 'Unable to find team ' + id
      });
    }

    req.team = team;
    next();
  });
};

