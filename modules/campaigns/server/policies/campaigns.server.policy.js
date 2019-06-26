'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'),
  path = require('path');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

var appAccessLib = require(path.resolve('./modules/users/server/libs/appAccess.server.lib'));

/**
 * Invoke Applications Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/applications/:applicationId/campaigns',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId/image',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId/duplicate',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaign_counts',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/applications/:applicationId/campaigns',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId/image',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaigns/:campaignId/duplicate',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/campaign_counts',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Applications Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var role = (req.user) ? req.user.role : 'guest';

  // Check for user roles
  acl.areAnyRolesAllowed(role, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access to the endpoint is granted! Check resource access now.
        return appAccessLib.getAppAccess(req.application, 'campaigns', req.user)
        .then(function(allowed){
          if (allowed) {
            next();
          } else {
            res.status(403).json({
              message: 'User is not authorized to access this resource'
            });
          }
        }).catch(function(err){
          res.status(403).json({
            message: 'User is not authorized to access this resource'
          });
        });
      } else {
        res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
