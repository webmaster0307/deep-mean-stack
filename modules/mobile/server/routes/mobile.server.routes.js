'use strict';

/**
 * Module dependencies.
 */
var auth = require('../controllers/authentication.server.controller'),
  appUserCtlr = require('../controllers/appUser.server.controller'),
  notificationCtlr = require('../controllers/notifications.server.controller'),
  events = require('../controllers/events.server.controller');

module.exports = function (app) {
  // Applications collection routes
  app.route('/api/mobile/authenticate')
    .post(auth.authenticate);

  app.route('/api/mobile/user/:appUserId')
    .put(auth.applicationByToken, appUserCtlr.update);

  app.route('/api/mobile/user/:appUserId/user_device')
    .post(auth.applicationByToken, appUserCtlr.updateUserDevice);

  app.route('/api/mobile/user/:appUserId/track_event')
    .post(auth.applicationByToken, events.track);

  app.route('/api/mobile/user/:appUserId/unread_notifications')
    .get(auth.applicationByToken, notificationCtlr.getUnreadNotifications);

  app.route('/api/mobile/user/:appUserId/notifications/:notificationId/set_read')
    .get(auth.applicationByToken, notificationCtlr.setNotificationRead);

  app.route('/api/mobile/send_verification_code')
    .get(auth.getAppUserByUUID, auth.sendVerifyToken);

  app.route('/api/mobile/verify_code')
    .get(auth.getAppUserByUUID, auth.verifyToken);

  // Finish by binding the application middleware
  app.param('appUserId', appUserCtlr.appUserById);
  app.param('notificationId', notificationCtlr.notificationById);
};
