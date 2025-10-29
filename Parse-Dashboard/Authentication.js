'use strict';
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OTPAuth = require('otpauth')

/**
 * Constructor for Authentication class
 *
 * @class Authentication
 * @param {Object[]} validUsers
 * @param {boolean} useEncryptedPasswords
 */
function Authentication(validUsers, useEncryptedPasswords, mountPath) {
  this.validUsers = validUsers;
  this.useEncryptedPasswords = useEncryptedPasswords || false;
  this.mountPath = mountPath;
}

function initialize(app, options) {
  options = options || {};
  const self = this;
  passport.use('local', new LocalStrategy(
    {passReqToCallback:true},
    function(req, username, password, cb) {
      const match = self.authenticate({
        name: username,
        pass: password,
        otpCode: req.body.otpCode
      });
      if (!match.matchingUsername) {
        return cb(null, false, { message: JSON.stringify({ text: 'Invalid username or password' }) });
      }
      if (!match.otpValid) {
        return cb(null, false, { message: JSON.stringify({ text: 'Invalid one-time password.', otpLength: match.otpMissingLength || 6}) });
      }
      if (match.otpMissingLength) {
        return cb(null, false, { message: JSON.stringify({ text: 'Please enter your one-time password.', otpLength: match.otpMissingLength || 6 })});
      }
      cb(null, match.matchingUsername);
    })
  );

  passport.serializeUser(function(username, cb) {
    cb(null, username);
  });

  passport.deserializeUser(function(username, cb) {
    const user = self.authenticate({
      name: username
    }, true);
    cb(null, user);
  });

  const cookieSessionSecret = options.cookieSessionSecret || require('crypto').randomBytes(64).toString('hex');
  const cookieSessionMaxAge = options.cookieSessionMaxAge;

  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({
    name: 'parse_dash',
    secret: cookieSessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: cookieSessionMaxAge,
      httpOnly: true,
      sameSite: 'lax',
    }
  }));
  app.use(require('connect-flash')());
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/login',
    csrf(),
    (req,res,next) => {
      let redirect = 'apps';
      let originalRedirect = null;
      if (req.body.redirect) {
        originalRedirect = req.body.redirect;
        // Validate redirect to prevent open redirect vulnerability
        if (originalRedirect.includes('://') || originalRedirect.startsWith('//')) {
          // Reject absolute URLs and protocol-relative URLs
          redirect = 'apps';
          originalRedirect = null;
        } else {
          // Strip leading slash from redirect to prevent double slashes
          redirect = originalRedirect.charAt(0) === '/' ? originalRedirect.substring(1) : originalRedirect;
        }
      }
      return passport.authenticate('local', {
        successRedirect: `${self.mountPath}${redirect}`,
        failureRedirect: `${self.mountPath}login${originalRedirect ? `?redirect=${originalRedirect}` : ''}`,
        failureFlash : true
      })(req, res, next)
    },
  );

  app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect(`${self.mountPath}login`);
    });
  });
}

/**
 * Authenticates the `userToTest`
 *
 * @param {Object} userToTest
 * @returns {Object} Object with `isAuthenticated` and `appsUserHasAccessTo` properties
 */
function authenticate(userToTest, usernameOnly) {
  let appsUserHasAccessTo = null;
  let matchingUsername = null;
  let isReadOnly = false;
  let otpMissingLength = false;
  let otpValid = true;

  //they provided auth
  const isAuthenticated = userToTest &&
    //there are configured users
    this.validUsers &&
    //the provided auth matches one of the users
    this.validUsers.find(user => {
      let isAuthenticated = false;
      const usernameMatches = userToTest.name == user.user;
      if (usernameMatches && user.mfa && !usernameOnly) {
        if (!userToTest.otpCode) {
          otpMissingLength = user.mfaDigits || 6;
        } else {
          const totp = new OTPAuth.TOTP({
            algorithm: user.mfaAlgorithm || 'SHA1',
            secret: OTPAuth.Secret.fromBase32(user.mfa),
            digits: user.mfaDigits,
            period: user.mfaPeriod,
          });
          const valid = totp.validate({
            token: userToTest.otpCode
          });
          if (valid === null) {
            otpValid = false;
            otpMissingLength = user.mfaDigits || 6;
          }
        }
      }
      const passwordMatches = this.useEncryptedPasswords && !usernameOnly ? bcrypt.compareSync(userToTest.pass, user.pass) : userToTest.pass == user.pass;
      if (usernameMatches && (usernameOnly || passwordMatches)) {
        isAuthenticated = true;
        matchingUsername = user.user;
        // User restricted apps
        appsUserHasAccessTo = user.apps || null;
        isReadOnly = !!user.readOnly; // make it true/false
      }
      return isAuthenticated;
    }) ? true : false;

  return {
    isAuthenticated,
    matchingUsername,
    otpMissingLength,
    otpValid,
    appsUserHasAccessTo,
    isReadOnly,
  };
}

Authentication.prototype.initialize = initialize;
Authentication.prototype.authenticate = authenticate;

module.exports = Authentication;
