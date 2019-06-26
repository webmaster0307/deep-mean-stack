'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * UserDevice Schema
 */
var UserDeviceSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  appUser: {
    type: Schema.ObjectId,
    ref: 'AppUser'
  },
  deviceToken: {
    type: String,
    trim: true,
    default: ''
  },

  // Personal Info
  email: {
    type: String,
    trim: true,
    default: ''
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  gender: {
    type: String
  },
  language: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },

  // Location info
  location: {
    lat: String,
    lng: String
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  zipcode: {
    type: String,
    trim: true,
    default: ''
  },

  // device info
  osNumber: {
    type: String,
    trim: true,
    default: '',
    required: 'OS number is required'
  },
  deviceVendor: {
    type: String,
    trim: true,
    defualt: '',
    required: 'Device Vendor is required'
  },
  deviceModel: {
    type: String,
    trim: true,
    default: '',
    required: 'Device Model is required'
  },
  devicePlatform: {
    type: String,
    trim: true,
    default: ''
  },
  carrier: {
    type: String,
    trim: true,
    default: ''
  },
  connectivityType: {
    type: String,
    trim: true,
    default: ''
  },

  // app info
  sdkVersion: {
    type: String,
    trim: true,
    default: ''
  },
  packageName: {
    type: String,
    trim: true,
    default: '',
  },
  appVersion: {
    type: String,
    trim: true,
    default: '',
    required: 'App Version is required'
  },
  pushNotificationEnabled: {
    type: Boolean,
    default: true
  },
  uninstalled: {
    type: Boolean,
    default: false
  }
});

mongoose.model('UserDevice', UserDeviceSchema);
