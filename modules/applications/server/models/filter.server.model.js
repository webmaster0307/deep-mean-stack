'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  _ = require('lodash'),
  Schema = mongoose.Schema;

/**
 * Filter Schema
 */
var FilterSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  body: {
    type: String
  }
});

/**
 * validates inner object of filter body for normal comparison operation
 * @function validateComparisonOperation
 * @param {string | Object} body
 * @returns {string | bool} error - if there is error, return error message, otherwise false
 */
var validateComparisonOperation = function(obj) {
  if (typeof obj === 'string' || typeof obj === 'number') return false;

  var allowedOpsForObj = ['$gt', '$gte', '$lt', '$lte', '$eq'];
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i += 1) {
    if (allowedOpsForObj.indexOf(keys[i]) === -1) {
      return 'invalid operator: ' + keys[i];
    }
  }

  return false;
};

/**
 * validates filter body
 * @function validateFilter
 * @param {Object} body
 * @returns {string | bool} error - if there is error, return error message, otherwise false
 */
var validateFilter = function(body) {
  console.log(body);
  var keys = Object.keys(body);
  var allowedOpsForArray = ['$and', '$or'];

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    var val = body[key];

    // logical operation always require array
    if (_.isArray(val)) {
      if (allowedOpsForArray.indexOf(key) === -1) {
        return 'invalid operator: ' + key;
      }

      // recursive check for array items
      for (var j = 0; j < val.length; j += 1) {
        var error = validateFilter(val[j]);
        if (error) {
          return error;
        }
      }
    } else {
      // for usual variables, validates for comparison operation
      var errMsg = validateComparisonOperation(val);
      if (errMsg) {
        return errMsg;
      }
    }
  }

  return false;
};

/**
 * Hook a pre validate method to validate filter body
 */
FilterSchema.pre('validate', function (next) {
  var error = validateFilter(JSON.parse(this.body));

  if (error) {
    this.invalidate('body', error);
  }

  next();
});

mongoose.model('Filter', FilterSchema);
