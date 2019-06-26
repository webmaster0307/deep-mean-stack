'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * CustomEvent Schema
 */
var CustomEventSchema = new Schema({
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
    required: 'CustomEvent name can not be blank'
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
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  filters: [{
    type: Schema.ObjectId,
    ref: 'Filter'
  }]
});

mongoose.model('CustomEvent', CustomEventSchema);
