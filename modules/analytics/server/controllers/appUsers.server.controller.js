'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
  appUserLib = require('../libs/appUser.server.lib'),
  filterLib = require('../libs/filter.server.lib'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * getAudiences
 */
exports.getAudiences = function(req, res) {
  appUserLib.getAppUsersBySegment(req.application, req.query.segmentId, req.query.offset, req.query.limit || 10)
  .then(function(result) {
    res.json(_.map(result, function(u) {
      return _.omit(u.toObject(), 'verifyDevice', 'verifyMethod', 'verifyToken'); // remove sensitive information
    }));
  })
  .catch(function(err) {
    console.log(err);
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.getAudienceCounts = function(req, res) {
  var deviceIds = [];
  AppUser.find({ application: req.application._id, userDevice: { $exists: true } }).select('userDevice')
  .then(function(userDevices) {
    deviceIds = _.map(userDevices, function(d) { return d.userDevice; });
    return Segment.find({ _id: { $in: req.body.segmentIds } });
  })
  .then(function(segments) {
    if (!segments.length) {
      segments = [{ _id: 'all' }];
    }

    var promises = _.map(segments, function(segment) {
      var match = segment.filter ? JSON.parse(segment.filter) : {};
      return UserDevice.aggregate([
        {
          $match:{
            $and: [
              { _id: { $in: deviceIds } },
              filterLib.parseFilter(match)
            ]
          },
        }, {
          $group: {
            _id: segment._id,
            count: { $sum: 1 }
          }
        }
      ]).exec();
    });
    return Promise.all(promises);
  })
  .then(function(result) {
    var resp = {};
    _.each(result, function(agg) {
      resp[agg[0]._id] = agg[0].count;
    });
    res.json(resp);
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.getAudienceCountByFilter = function(req, res) {
  var deviceIds = [];
  var appUserFilter = {
    application: req.application._id,
    userDevice: { $exists: true }
  };

  if (req.body.appUserFilter) {
    appUserFilter = _.extend(appUserFilter, filterLib.parseFilter(req.body.appUserFilter));
  }

  AppUser.find(appUserFilter)
  .sort('-created')
  .select('userDevice')
  .then(function(userDevices) {
    deviceIds = _.map(userDevices, function(d) { return d.userDevice; });
    return UserDevice.aggregate([
      {
        $match: {
          $and: [
            { _id: { $in: deviceIds } },
            filterLib.parseFilter(req.body.filter)
          ]
        },
      }, {
        $group: {
          _id: req.body.groupBy || 'filtered',
          count: { $sum: 1 }
        }
      }
    ]).exec();
  })
  .then(function(result) {
    if (req.body.groupBy) {
      res.json(result);
    } else {
      res.json(result.length ? { count: result[0].count, total: deviceIds.length } : { count: 0, total: deviceIds.length });
    }
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};
