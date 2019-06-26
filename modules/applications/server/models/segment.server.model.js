'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Segment Schema
 */
var SegmentSchema = new Schema({
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
    required: 'Segment name can not be blank'
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  favorite: {
    type: Boolean,
    default: false
  },
  filter: {
    type: String
  },
  status: {
    type: String,
    default: 'ACTIVE'
  }
});

mongoose.model('Segment', SegmentSchema);
