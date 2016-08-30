"use strict";

/**
 * Constructor for Authentication class
 * 
 * @class Authentication
 * @param {Object[]} validUsers
 * @param {boolean} useEncryptedPasswords
 */
function Authentication(validUsers, useEncryptedPasswords) {
    this.validUsers = validUsers;
    this.useEncryptedPasswords = useEncryptedPasswords || false;
}

/**
 * Authenticates the `userToTest`
 * 
 * @param {Object} userToTest
 * @returns {Object} Object with `isAuthenticated` and `appsUserHasAccessTo` properties
 */
function authenticate(userToTest) {
  let bcrypt = require('bcryptjs');

  var appsUserHasAccessTo = null;

  //they provided auth
  let isAuthenticated = userToTest &&
    //there are configured users
    this.validUsers &&
    //the provided auth matches one of the users
    this.validUsers.find(user => {
      let isAuthenticated = userToTest.name == user.user &&
                        (this.useEncryptedPasswords ? bcrypt.compareSync(userToTest.pass, user.pass) : userToTest.pass == user.pass);
      if (isAuthenticated) {
        // User restricted apps
        appsUserHasAccessTo = user.apps || null;
      }

      return isAuthenticated;
    }) ? true : false;
  
  return {
    isAuthenticated,
    appsUserHasAccessTo
  };
}

Authentication.prototype.authenticate = authenticate;

module.exports = Authentication;
