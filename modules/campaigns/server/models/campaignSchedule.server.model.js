'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * CampaignSchedule Schema
 */
var CampaignScheduleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  repeat: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  sendDate: {
    type: Date
  },
  timeZone: {
    type: String,
    default: '',
    trim: ''
  },
  status: {
    type: String,
    enum: ['ready', 'inprogress']
  },
  lastSent: {
    type: Date
  },
  frequency: {
    type: String,
    enum: ['immediate', 'scheduled']
  },
  jobId: {
    type: String,
    default: ''
  },
  campaign: {
    type: Schema.ObjectId,
    ref: 'Campaign'
  }
});

mongoose.model('CampaignSchedule', CampaignScheduleSchema);
