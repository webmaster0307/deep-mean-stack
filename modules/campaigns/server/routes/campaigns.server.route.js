'use strict';

/**
 * Module dependencies.
 */
var campaignsPolicy = require('../policies/campaigns.server.policy'),
  campaigns = require('../controllers/campaigns.server.controller');

module.exports = function (app) {
  // Applications collection routes
  app.route('/api/applications/:applicationId/campaigns').all(campaignsPolicy.isAllowed)
    .get(campaigns.list)
    .post(campaigns.create);

  // Single application routes
  app.route('/api/applications/:applicationId/campaigns/:campaignId').all(campaignsPolicy.isAllowed)
    .get(campaigns.read)
    .put(campaigns.update)
    .delete(campaigns.delete);

  app.route('/api/applications/:applicationId/campaign_counts').all(campaignsPolicy.isAllowed)
    .get(campaigns.getCount);

  app.route('/api/applications/:applicationId/campaigns/:campaignId/image').all(campaignsPolicy.isAllowed)
    .post(campaigns.uploadImage);

  app.route('/api/applications/:applicationId/campaigns/:campaignId/duplicate').all(campaignsPolicy.isAllowed)
    .get(campaigns.duplicate);

  // Finish by binding the campaign middleware
  app.param('campaignId', campaigns.campaignByID);
};
