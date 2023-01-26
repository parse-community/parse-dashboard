'use strict';
var bcrypt = require('bcryptjs');
var csrf = require('csurf');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
  var self = this;
  passport.use('local', new LocalStrategy(
    {passReqToCallback:true},
    function(req, username, password, cb) {
      var match = self.authenticate({
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
    var user = self.authenticate({
      name: username
    }, true);
    cb(null, user);
  });

  var cookieSessionSecret = options.cookieSessionSecret || require('crypto').randomBytes(64).toString('hex');
  const cookieSessionMaxAge = options.cookieSessionMaxAge;
  app.use(require('connect-flash')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('cookie-session')({
    key    : 'parse_dash',
    secret : cookieSessionSecret,
    maxAge : cookieSessionMaxAge
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/login',
    csrf(),
      (req,res,next) => {
        let redirect = 'apps';
        if (req.body.redirect) {
          redirect = req.body.redirect.charAt(0) === '/' ? req.body.redirect.substring(1) : req.body.redirect
        }
        return passport.authenticate('local', {
          successRedirect: `${self.mountPath}${redirect}`,
          failureRedirect: `${self.mountPath}login${req.body.redirect ? `?redirect=${req.body.redirect}` : ''}`,
          failureFlash : true
        })(req, res, next)
    },
  );

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect(`${self.mountPath}login`);
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
  let isAuthenticated = userToTest &&
    //there are configured users
    this.validUsers &&
    //the provided auth matches one of the users
    this.validUsers.find(user => {
      let isAuthenticated = false;
      let usernameMatches = userToTest.name == user.user;
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
      let passwordMatches = this.useEncryptedPasswords && !usernameOnly ? bcrypt.compareSync(userToTest.pass, user.pass) : userToTest.pass == user.pass;
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
