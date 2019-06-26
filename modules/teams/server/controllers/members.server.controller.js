'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  User = mongoose.model('User'),
  Team = mongoose.model('Team'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Lists TeamMembers
 */
exports.list = function (req, res) {
  var team = req.team;
  res.json(team.members);
};

/**
 * Create a TeamMember
 */
exports.create = function (req, res) {
  var team = req.team;
  var member = req.member;
  var existing = team.members.findIndex(function(elem) {
    return elem._id.equals(member._id);
  });
  if (existing < 0) team.members.push(member);
  team.members = team.members.filter(function(item, pos, self) {
    return self.indexOf(item) === pos;
  });
  member.team = team;
  member.save(function (err){
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    }

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
 * Delete a TeamMember
 */
exports.delete = function (req, res) {
  var team = req.team;
  var member = req.member;

  team.members.splice(member, 1);
  member.team = undefined;
  member.save(function (err){
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    }

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
 * memberById middleware
 */
exports.memberByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id,
    parent: req.user
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.status(400).send({
        message: 'Failed to load user ' + id
      });
    }

    req.member = user;
    next();
  });
};