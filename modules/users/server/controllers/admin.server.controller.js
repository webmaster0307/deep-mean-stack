'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  jwt = require('jsonwebtoken'),
  config = require(path.resolve('./config/config')),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Create a User
 */
exports.create = function (req, res) {

    // Init Variables
  var user = new User(_.pick(req.body, 'firstName', 'lastName', 'password', 'verified', 'disabled', 'address', 'phone', 'email', 'company'));

  // Add missing user fields
  user.provider = 'local';
  user.parent = req.user;
  user.role = req.user.role === 'superadmin' ? 'admin' : 'user';

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      res.json(user);
    }
  });

};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user = _.extend(
    user,
    _.pick(req.body, 'firstName', 'lastName', 'password', 'verified', 'disabled', 'address', 'phone', 'email', 'company')
  );

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
        errors: errorHandler.getFieldErrors(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  var filter = {};
  if (req.user.role === 'admin') {
    filter.parent = req.user._id;
  }

  if (req.query.role) {
    filter.role = req.query.role;
  }

  User.find(filter, '-salt -password').sort({ firstName: 1, lastName: 1 }).populate('user').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

exports.fetchToken = function (req, res) {
  var userJSON = _.pick(req.model.toJSON(), '_id', 'firstName', 'lastName', 'email', 'profileImageURL', 'company', 'role');
  var token = jwt.sign(userJSON, config.apiSecret, {
    expiresIn: config.apiTokenExpire * 60
  });
  res.json(_.extend({
    token: token
  }, userJSON));
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};

/**
 * Filter middleware
 */
exports.validateParent = function (req, res, next) {
  var user = req.model;

  if (req.user.role === 'superadmin') {
    next();
  } else if (!user.parent || !user.parent.equals(req.user._id)) {
    return res.status(403).send({
      message: 'Authorization error, you can not access this user.'
    });
  }

  next();
};
