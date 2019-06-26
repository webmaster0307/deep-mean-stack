'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Image Schema
 */
var ImageSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  type: {
    type: String,
    trim: true,
    required: 'Image type can not be blank'
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  size: {
    type: Number,
    default: 0
  },
  duration: { // image animation duration
    type: Number,
    default: 0
  }
});

mongoose.model('Image', ImageSchema);
