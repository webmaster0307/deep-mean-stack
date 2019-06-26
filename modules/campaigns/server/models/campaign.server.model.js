'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Campaign Schema
 */
var CampaignSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  campaignType: {
    type: String,
    enum: ['url', 'deep-link', 'in-app-message'],
    default: 'url'
  },
  title: {
    type: String,
    trim: true,
    required: 'Campaign title can not be blank'
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  platform: [{
    name: {
      type: String
    },
    displayType: [{
      type: String
    }]
  }],
  animation: {
    type: Schema.ObjectId,
    ref: 'Image'
  },
  loopCount: {
    type: Number,
    max: 100,
    min: 1,
    default: 1
  },
  loopDelay: {
    type: Number,
    default: 0,
    min: 0,
    max: 30 * 60 * 1000 // 30 mins
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  messagePosition: {
    type: String,
    enum: ['top', 'bottom', 'center'],
    default: 'top'
  },
  expiresAt: {
    type: Date
  },
  deliveryAction: {
    dpLimit: {
      type: Number,
      default: 1
    },
    dayLimit: {
      type: Number,
      default: 1
    },
    actionType: {
      type: String
    },
    isUsed: {
      type: Boolean
    }
  },
  deliverySchedule: {
    type: Schema.ObjectId,
    ref: 'CampaignSchedule'
  },
  tags: [{
    type: String,
    trim: true,
    required: 'Tag should not be blank'
  }],
  segment: {
    type: Schema.ObjectId,
    ref: 'Segment'
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  status: {
    type: String,
    default: 'DRAFT'
  }
});

mongoose.model('Campaign', CampaignSchema);
