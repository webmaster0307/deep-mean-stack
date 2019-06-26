'use strict';

var mongoose = require('mongoose'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
  _ = require('lodash'),
  filterLib = require('./filter.server.lib'),
  Promise = require('bluebird');

mongoose.Promise = Promise;

exports.getAppUsersBySegment = function(application, segmentId, offset, limit) {
  offset = offset * 1 || 0;

  return new Promise(function(resolve, reject){
    var promise = Promise.resolve();
    if (segmentId) {
      promise = Segment.findById(segmentId).exec();
    }

    promise.then(function(segment) {
      var match = segment ? JSON.parse(segment.filter) : {};
      return AppUser.find({ application: application._id }).populate({
        path: 'userDevice',
        match: filterLib.parseFilter(match)
      }).sort('-created');
    }).then(function(appUsers) {
      // now filter app users
      appUsers = _.filter(appUsers, function(u) { return u.userDevice; });
      limit = limit * 1;
      if (limit) {
        appUsers = appUsers.slice(offset, offset + limit);
      } else {
        appUsers = appUsers.slice(offset);
      }

      resolve(appUsers);
    }).catch(function(err) {
      reject(err);
    });
  });
};
