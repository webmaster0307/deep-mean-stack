'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  appName: {
    type: String,
    default: '',
    trim: true,
    required: 'Application name can not be blank'
  },
  packageName: {
    type: String,
    default: '',
    trim: true,
    unique: 'Package name already exists',
    required: 'Package name can not be blank'
  },
  environment: {
    type: String,
    trim: true,
    default: 'development'
  },
  apiKey: {
    type: String,
    default: '',
    trim: true
  },
  apiSecret: {
    type: String,
    default: '',
    trim: true
  },
  fcmServerKey: {
    type: String,
    default: '',
    trim: true
  },
  keyPem: {
    type: String,
    default: '',
    trim: true
  },
  certPem: {
    type: String,
    default: '',
    trim: true
  },
  passPhrase: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Application', ApplicationSchema);
