/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../../Parse-Dashboard/Authentication.js');
jest.dontMock('bcryptjs');

const Authentication = require('../../../Parse-Dashboard/Authentication');
const apps = [{appId: 'test123'}, {appId: 'test789'}];
const readOnlyApps = apps.map((app) => {
  app.readOnly = true;
  return app;
});

const unencryptedUsers = [
  {
    user: 'parse.dashboard',
    pass: 'abc123'
  },
  {
    user: 'parse.apps',
    pass: 'xyz789',
    apps: apps
  },
  {
    user: 'parse.readonly',
    pass: 'abc123',
    readOnly: true,
  },
  {
    user: 'parse.readonly.apps',
    pass: 'abc123',
    apps: readOnlyApps,
  }
];
const encryptedUsers = [
  {
    user: 'parse.dashboard',
    pass: '$2a$08$w92YfzwkhB3WGFTBjHwZLO2tSwNIS2rX0qQER.TF8izEzWF5M.U8S'
  },
  {
    user: 'parse.apps',
    pass: '$2a$08$B666bpJqE9v/R5KNbgfOMOjycvHzv6zWs0sGky/QuBZb4HY0M6LE2',
    apps: apps
  }
]

function createAuthenticationResult(isAuthenticated, matchingUsername, appsUserHasAccessTo, isReadOnly) {
  isReadOnly = !!isReadOnly;
  return {
    isAuthenticated,
    matchingUsername,
    appsUserHasAccessTo,
    isReadOnly,
    otpMissingLength: false,
    otpValid: true
  }
}

describe('Authentication', () => {
  it('does not authenticate with no users', () => {
    let authentication = new Authentication(null, false);
    expect(authentication.authenticate({name: 'parse.dashboard', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('does not authenticate with no auth', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate(null))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('does not authenticate invalid user', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.invalid', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('does not authenticate valid user with invalid unencrypted password', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.dashboard', pass: 'xyz789'}))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('authenticates valid user with valid unencrypted password', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.dashboard', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(true, 'parse.dashboard', null));
  });

  it('returns apps if valid user', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.apps', pass: 'xyz789'}))
      .toEqual(createAuthenticationResult(true, 'parse.apps', apps));
  });

  it('authenticates valid user with valid encrypted password', () => {
    let authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({name: 'parse.dashboard', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(true, 'parse.dashboard', null));
  });

  it('does not authenticate valid user with invalid encrypted password', () => {
    let authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({name: 'parse.dashboard', pass: 'xyz789'}))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('authenticates valid user with valid username and usernameOnly', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.dashboard'}, true))
      .toEqual(createAuthenticationResult(true, 'parse.dashboard', null));
  });

  it('does not authenticate valid user with valid username and no usernameOnly', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.dashboard'}))
      .toEqual(createAuthenticationResult(false, null, null));
  });

  it('authenticates valid user with valid username and usernameOnly and encrypted password', () => {
    let authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({name: 'parse.dashboard'}, true))
      .toEqual(createAuthenticationResult(true, 'parse.dashboard', null));
  });

  it('makes readOnly auth when specified', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.readonly', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(true, 'parse.readonly', null, true));
  });

  it('makes readOnly auth when specified in apps', () => {
    let authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({name: 'parse.readonly.apps', pass: 'abc123'}))
      .toEqual(createAuthenticationResult(true, 'parse.readonly.apps', readOnlyApps, false));
  });
});
