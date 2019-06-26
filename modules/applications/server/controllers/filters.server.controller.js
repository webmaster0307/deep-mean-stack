'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Filter = mongoose.model('Filter'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// @TODO deprecate filters

/**
 * Create a filter
 */
exports.create = function (req, res) {
  var filterJSON = _.pick(req.body, 'body');
  filterJSON.body = JSON.stringify(filterJSON.body);
  var filter = new Filter(filterJSON);

  filter.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(filter);
    }
  });
};

/**
 * Show the current filter
 */
exports.read = function (req, res) {
  res.json(req.filter);
};

/**
 * Update a filter
 */
exports.update = function (req, res) {
  var filter = req.filter;

  filter = _.extend(
    filter,
    _.pick(req.body, 'body')
  );

  if (_.isObject(filter.body)) {
    filter.body = JSON.stringify(filter.body);
  }

  filter.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(filter);
    }
  });
};

/**
 * Delete an filter
 */
exports.delete = function (req, res) {
  var filter = req.filter;

  filter.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(filter);
    }
  });
};

/**
 * List of Filters
 */
exports.list = function (req, res) {
  Filter.find({}).sort('-created').exec(function (err, filters) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(filters);
    }
  });
};

/**
 * Filter middleware
 */
exports.filterByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Filter is invalid'
    });
  }

  Filter.findById(id).exec(function (err, filter) {
    if (err) {
      return next(err);
    } else if (!filter) {
      return res.status(404).send({
        message: 'No filter with that identifier has been found'
      });
    }
    req.filter = filter;
    next();
  });
};
