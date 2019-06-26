'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var CustomEventModel = mongoose.model('CustomEvent');

/**
 * Create a customEvent
 */
exports.create = function (req, res) {
  var customEventJSON = _.pick(req.body, 'name', 'eventType', 'eventValue', 'eventTarget');
  var customEvent = new CustomEventModel(customEventJSON);
  customEvent.application = req.application._id;

  customEvent.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(customEvent);
    }
  });
};

/**
 * Show the current customEvent
 */
exports.read = function (req, res) {
  res.json(req.customEvent);
};

/**
 * Update a customEvent
 */
exports.update = function (req, res) {
  var customEvent = req.customEvent;

  customEvent = _.extend(
    customEvent,
    _.pick(req.body, 'name', 'eventType', 'eventTarget', 'eventValue')
  );

  customEvent.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(customEvent);
    }
  });
};

/**
 * Delete an customEvent
 */
exports.delete = function (req, res) {
  var customEvent = req.customEvent;

  customEvent.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(customEvent);
    }
  });
};

/**
 * List of CustomEvents
 */
exports.list = function (req, res) {
  CustomEventModel.find({ application: req.application._id }).sort('-created').exec(function (err, customEvents) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(customEvents);
    }
  });
};

/**
 * CustomEvent middleware
 */
exports.customEventByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'CustomEvent is invalid'
    });
  }

  CustomEventModel.findById(id).exec(function (err, customEvent) {
    if (err) {
      return next(err);
    } else if (!customEvent) {
      return res.status(404).send({
        message: 'No customEvent with that identifier has been found'
      });
    }
    req.customEvent = customEvent;
    next();
  });
};
