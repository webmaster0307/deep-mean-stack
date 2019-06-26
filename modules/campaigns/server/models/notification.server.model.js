'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
  created: { // used for notification send date
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
  campaign: {
    type: Schema.ObjectId,
    ref: 'Campaign'
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3], // 0 - not sent, 1 - failed to send, 2 - sent, 3 - received
    default: 0
  }
});

mongoose.model('Notification', NotificationSchema);
