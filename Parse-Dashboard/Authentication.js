"use strict";
function Authentication(validUsers, useEncryptedPasswords) {
    this.validUsers = validUsers;
    this.useEncryptedPasswords = useEncryptedPasswords || false;
}

Authentication.prototype.authenticate = function (userToTest) {
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
};

module.exports = Authentication;
