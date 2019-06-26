'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  moment = require('moment'),
  mailer = require(path.resolve('./config/lib/mailer')),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

function sendConfirmEmail(req, res, user) {
  var httpTransport = 'http://';
  if (config.secure && config.secure.ssl === true) {
    httpTransport = 'https://';
  }
  user.confirmToken = randomstring.generate({ length: 20 });
  user.confirmTokenExpires = moment().add(1, 'hour').toDate();
  return user.save().then(function() {
    return new Promise(function(resolve, reject) {
      res.render(path.resolve('modules/users/server/templates/verify-email'), {
        name: user.firstName + ' ' + user.lastName,
        appName: config.app.title,
        url: httpTransport + config.url + '/app/auth/verify?verifyToken=' + user.confirmToken + '&email=' + user.email
      }, function (err, emailHTML) {
        if (err) {
          reject(err);
        } else {
          mailer.sendMail({
            to: user.email,
            subject: 'Verify your email address at ' + config.app.title,
            html: emailHTML
          }).then(function(result) {
            resolve(result);
          }).catch(function(err2) {
            reject(err2);
          });
        }
      });
    });
  });
}

exports.sendConfirmEmail = function(req, res) {
  var user;
  User.findOne({ email: req.query.email })
  .then(function(userObj) {
    user = userObj;
    if (!userObj) {
      throw new Error('User not found');
    } else if (userObj.verified) {
      throw new Error('Your account is already verified');
    } else {
      return sendConfirmEmail(req, res, userObj);
    }
  })
  .then(function() {
    res.send({
      status: 'SUCCESS',
      message: 'Verification email sent to ' + user.email
    });
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.verifyAccount = function(req, res) {
  User.findOne({ email: req.query.email, confirmToken: req.query.confirmToken })
  .then(function(user) {
    if (!user) {
      throw new Error('Account not found');
    } else if (moment().diff(user.confirmTokenExpires) > 0) {
      throw new Error('Confirm Token Expired');
    } else {
      user.verified = true;
      user.confirmToken = '';
      return user.save();
    }
  })
  .then(function() {
    res.send({ status: 'Your account is verified' });
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.role;
  delete req.body.disabled;
  delete req.body.verified;

  // Init Variables
  var user = new User(req.body);

  // Add missing user fields
  user.provider = 'local';
  user.role = 'admin';

  user.save()
  .then(function(newUser) {
    return sendConfirmEmail(req, res, newUser);
  })
  .then(function() {
    res.send({
      status: 'SUCCESS',
      message: 'Verification email sent to ' + user.email
    });
  })
  .catch(function(err){
    console.log(err);
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      if (user.disabled) {
        res.status(401).send({ message: 'You account has been deactivated. Please contact administrator.' });
      } else if (!user.verified) {
        res.status(403).send({ message: 'Account is not verified yet.' });
      } else {
        var userJSON = _.pick(user.toJSON(), '_id', 'firstName', 'lastName', 'email', 'profileImageURL', 'company', 'role');

        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            var token = jwt.sign(userJSON, config.apiSecret, {
              expiresIn: config.apiTokenExpire * 60
            });
            var jsonData = _.extend(userJSON, { token: token });
            res.json(jsonData);
          }
        });
      }
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, redirectURL) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};
