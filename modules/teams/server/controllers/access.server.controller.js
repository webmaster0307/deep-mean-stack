'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  User = mongoose.model('User'),
  Team = mongoose.model('Team'),
  Application = mongoose.model('Application'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Lists TeamAccess
 */
exports.list = function (req, res) {
  var team = req.team;
  res.json(team.access);
};

/**
 * Create a TeamAccess
 */
exports.create = function (req, res) {
  var team = req.team;
  var application_id = req.body.application;
  Application.findOne({
    _id: application_id,
    user: req.user
  }).exec(function (err, application) {
    if (err || !application) {
      return res.status(400).send({
        message: 'Application is not found ' + application_id
      });
    }

    team.access.push({
      application: application,
      resource: req.body.resource
    });
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
  });
};

/**
 * Update a TeamAccess
 */
exports.update = function (req, res) {
  var team = req.team;
  var application_id = req.body.application;
  Application.findOne({
    _id: application_id,
    user: req.user
  }).exec(function (err, application) {
    if (err || !application) {
      return res.status(400).send({
        message: 'Application is not found ' + application_id
      });
    }

    var access = req.access;
    access.application = application;
    access.resource = req.body.resource;
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
  });
};

/**
 * Delete a TeamAccess
 */
exports.delete = function (req, res) {
  var team = req.team;
  var access = req.access;

  team.access.splice(access, 1);
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
 * TeamAccessId middleware
 */
exports.accessByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'TeamAccess id is invalid'
    });
  }

  var access = _.find(req.team.access, { _id: mongoose.Types.ObjectId(id) });
  if (!access) {
    return res.status(400).send({
      message: 'Unable to find team access ' + id
    });
  }

  req.access = access;
  next();
};