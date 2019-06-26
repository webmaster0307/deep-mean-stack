'use strict';

/**
 * Module dependencies.
 */
var imagesPolicy = require('../policies/images.server.policy'),
  images = require('../controllers/images.server.controller');

module.exports = function (app) {
  app.route('/api/images/upload').all(imagesPolicy.isAllowed)
    .post(images.uploadImage);
};
