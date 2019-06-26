'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * AppUser Schema
 */
var AppUserSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  uuid: {
    type: String,
    required: 'UUID can not be blank'
  },
  preferences: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  verifyToken: {
    type: String,
    default: ''
  },
  verifyMethod: {
    type: String,
    default: 'phone'
  },
  verifyDevice: {
    type: String,
    default: ''
  },
  userDevice: {
    type: Schema.ObjectId,
    ref: 'UserDevice'
  }
});

mongoose.model('AppUser', AppUserSchema);
