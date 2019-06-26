'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * AnalyticEvent Schema
 */
var AnalyticEventSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  eventType: {
    type: String,
    trim: true,
    default: ''
  },
  eventTarget: {
    type: String,
    trim: true,
    default: ''
  },
  eventValue: {
    type: String,
    trim: true,
    default: ''
  },
  userDevice: {
    type: Schema.ObjectId,
    ref: 'UserDevice'
  }
});

mongoose.model('AnalyticEvent', AnalyticEventSchema);
