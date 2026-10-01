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
const apps = [{ appId: 'test123' }, { appId: 'test789' }];
const readOnlyApps = apps.map(app => {
  app.readOnly = true;
  return app;
});

const unencryptedUsers = [
  {
    user: 'parse.dashboard',
    pass: 'abc123',
  },
  {
    user: 'parse.apps',
    pass: 'xyz789',
    apps: apps,
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
  },
];
const encryptedUsers = [
  {
    user: 'parse.dashboard',
    pass: '$2a$08$w92YfzwkhB3WGFTBjHwZLO2tSwNIS2rX0qQER.TF8izEzWF5M.U8S',
  },
  {
    user: 'parse.apps',
    pass: '$2a$08$B666bpJqE9v/R5KNbgfOMOjycvHzv6zWs0sGky/QuBZb4HY0M6LE2',
    apps: apps,
  },
];

function createAuthenticationResult(
  isAuthenticated,
  matchingUsername,
  appsUserHasAccessTo,
  isReadOnly
) {
  isReadOnly = !!isReadOnly;
  return {
    isAuthenticated,
    matchingUsername,
    appsUserHasAccessTo,
    isReadOnly,
    otpMissingLength: false,
    otpValid: true,
  };
}

describe('Authentication', () => {
  it('does not authenticate with no users', () => {
    const authentication = new Authentication(null, false);
    expect(authentication.authenticate({ name: 'parse.dashboard', pass: 'abc123' })).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('does not authenticate with no auth', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate(null)).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('does not authenticate invalid user', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.invalid', pass: 'abc123' })).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('does not authenticate valid user with invalid unencrypted password', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.dashboard', pass: 'xyz789' })).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('authenticates valid user with valid unencrypted password', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.dashboard', pass: 'abc123' })).toEqual(
      createAuthenticationResult(true, 'parse.dashboard', null)
    );
  });

  it('returns apps if valid user', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.apps', pass: 'xyz789' })).toEqual(
      createAuthenticationResult(true, 'parse.apps', apps)
    );
  });

  it('authenticates valid user with valid encrypted password', () => {
    const authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({ name: 'parse.dashboard', pass: 'abc123' })).toEqual(
      createAuthenticationResult(true, 'parse.dashboard', null)
    );
  });

  it('does not authenticate valid user with invalid encrypted password', () => {
    const authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({ name: 'parse.dashboard', pass: 'xyz789' })).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('authenticates valid user with valid username and usernameOnly', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.dashboard' }, true)).toEqual(
      createAuthenticationResult(true, 'parse.dashboard', null)
    );
  });

  it('does not authenticate valid user with valid username and no usernameOnly', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.dashboard' })).toEqual(
      createAuthenticationResult(false, null, null)
    );
  });

  it('authenticates valid user with valid username and usernameOnly and encrypted password', () => {
    const authentication = new Authentication(encryptedUsers, true);
    expect(authentication.authenticate({ name: 'parse.dashboard' }, true)).toEqual(
      createAuthenticationResult(true, 'parse.dashboard', null)
    );
  });

  it('makes readOnly auth when specified', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(authentication.authenticate({ name: 'parse.readonly', pass: 'abc123' })).toEqual(
      createAuthenticationResult(true, 'parse.readonly', null, true)
    );
  });

  it('makes readOnly auth when specified in apps', () => {
    const authentication = new Authentication(unencryptedUsers, false);
    expect(
      authentication.authenticate({
        name: 'parse.readonly.apps',
        pass: 'abc123',
      })
    ).toEqual(createAuthenticationResult(true, 'parse.readonly.apps', readOnlyApps, false));
  });
});

describe('Authentication with MFA', () => {
  // Secrets and expected one-time passwords are the test vectors of RFC 6238 Appendix B,
  // with the ASCII seeds encoded as base32.
  const sha1Secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const sha256Secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZA====';
  const sha512Secret =
    'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNA=';
  const mfaUsers = [
    {
      user: 'parse.mfa',
      pass: 'abc123',
      mfa: sha1Secret,
    },
    {
      user: 'parse.mfa.lowercase',
      pass: 'abc123',
      mfa: sha1Secret.toLowerCase(),
    },
    {
      user: 'parse.mfa.digits',
      pass: 'abc123',
      mfa: sha1Secret,
      mfaDigits: 8,
    },
    {
      user: 'parse.mfa.sha256',
      pass: 'abc123',
      mfa: sha256Secret,
      mfaAlgorithm: 'SHA256',
      mfaDigits: 8,
    },
    {
      user: 'parse.mfa.sha512',
      pass: 'abc123',
      mfa: sha512Secret,
      mfaAlgorithm: 'SHA512',
      mfaDigits: 8,
    },
  ];

  afterEach(() => {
    jest.useRealTimers();
  });

  function authenticateAt(timestamp, name, otpCode) {
    jest.useFakeTimers();
    jest.setSystemTime(timestamp);
    const authentication = new Authentication(mfaUsers, false);
    return authentication.authenticate({ name, pass: 'abc123', otpCode });
  }

  it('requires one-time password if none is provided', () => {
    const authentication = new Authentication(mfaUsers, false);
    expect(authentication.authenticate({ name: 'parse.mfa', pass: 'abc123' })).toEqual(
      expect.objectContaining({ otpMissingLength: 6, otpValid: true })
    );
    expect(authentication.authenticate({ name: 'parse.mfa.digits', pass: 'abc123' })).toEqual(
      expect.objectContaining({ otpMissingLength: 8, otpValid: true })
    );
  });

  it('accepts valid one-time password with default algorithm and digits', () => {
    expect(authenticateAt(59 * 1000, 'parse.mfa', '287082')).toEqual(
      createAuthenticationResult(true, 'parse.mfa', null)
    );
  });

  it('accepts valid one-time password with lowercase secret', () => {
    expect(authenticateAt(59 * 1000, 'parse.mfa.lowercase', '287082')).toEqual(
      createAuthenticationResult(true, 'parse.mfa.lowercase', null)
    );
  });

  it('accepts valid one-time password with custom digits', () => {
    expect(authenticateAt(1111111109 * 1000, 'parse.mfa.digits', '07081804')).toEqual(
      createAuthenticationResult(true, 'parse.mfa.digits', null)
    );
  });

  it('accepts valid one-time password with SHA256 and padded secret', () => {
    expect(authenticateAt(1111111109 * 1000, 'parse.mfa.sha256', '68084774')).toEqual(
      createAuthenticationResult(true, 'parse.mfa.sha256', null)
    );
  });

  it('accepts valid one-time password with SHA512 and padded secret', () => {
    expect(authenticateAt(1111111109 * 1000, 'parse.mfa.sha512', '25091201')).toEqual(
      createAuthenticationResult(true, 'parse.mfa.sha512', null)
    );
  });

  it('accepts one-time password of adjacent time step', () => {
    expect(authenticateAt(59 * 1000, 'parse.mfa', '755224')).toEqual(
      expect.objectContaining({ otpMissingLength: false, otpValid: true })
    );
    expect(authenticateAt(59 * 1000, 'parse.mfa', '359152')).toEqual(
      expect.objectContaining({ otpMissingLength: false, otpValid: true })
    );
  });

  it('rejects one-time password outside of validation window', () => {
    expect(authenticateAt(59 * 1000, 'parse.mfa', '969429')).toEqual(
      expect.objectContaining({ otpMissingLength: 6, otpValid: false })
    );
  });

  it('rejects invalid one-time password', () => {
    expect(authenticateAt(59 * 1000, 'parse.mfa', '000000')).toEqual(
      expect.objectContaining({ otpMissingLength: 6, otpValid: false })
    );
    expect(authenticateAt(1111111109 * 1000, 'parse.mfa.sha256', '00000000')).toEqual(
      expect.objectContaining({ otpMissingLength: 8, otpValid: false })
    );
  });
});
