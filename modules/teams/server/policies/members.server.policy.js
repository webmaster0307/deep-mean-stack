'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/teams/:teamId/members',
      permissions: '*'
    }, {
      resources: '/api/teams/:teamId/members/:memberId',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Admin Policy Allows
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
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
