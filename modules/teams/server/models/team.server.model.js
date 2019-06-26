'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Team Schema
 */
var TeamSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  name: {
    type: String,
    trim: true,
    required: 'Team name is required'
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  members: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  access: [{
    application: {
      type: Schema.ObjectId,
      ref: 'Application',
      required: 'Application is required'
    },
    resource: {
      type: String,
      trim: true,
      required: 'Resource is required'
    }
  }],
});

mongoose.model('Team', TeamSchema);
