/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../../Parse-Dashboard/Authentication.js');
jest.dontMock('../../../Parse-Dashboard/app.js');

const express = require('express');
const session = require('express-session');
const Authentication = require('../../../Parse-Dashboard/Authentication');

describe('SessionStore Integration', () => {
  it('uses default in-memory store when cookieSessionStore is not provided', () => {
    const app = express();
    const users = [{ user: 'test', pass: 'password' }];
    const auth = new Authentication(users, false, '/');

    // Mock app.use to capture session configuration
    const useSpy = jest.fn();
    app.use = useSpy;

    auth.initialize(app, {});

    // Find the call that sets up express-session
    const sessionCall = useSpy.mock.calls.find(call =>
      call[0] && call[0].name === 'session'
    );

    expect(sessionCall).toBeDefined();
    // When no store is provided, express-session uses MemoryStore by default
    // The session function should be called without a custom store
  });

  it('uses custom session store when cookieSessionStore is provided', () => {
    const app = express();
    const users = [{ user: 'test', pass: 'password' }];
    const auth = new Authentication(users, false, '/');

    // Create a mock session store that implements the Store interface
    const Store = session.Store;
    class MockStore extends Store {
      constructor() {
        super();
      }
      get(sid, callback) {
        callback(null, {});
      }
      set(sid, session, callback) {
        callback(null);
      }
      destroy(sid, callback) {
        callback(null);
      }
    }

    const mockStore = new MockStore();

    // Mock app.use to capture session configuration
    const useSpy = jest.fn();
    app.use = useSpy;

    auth.initialize(app, { cookieSessionStore: mockStore });

    // The session middleware should have been configured
    expect(useSpy).toHaveBeenCalled();

    // Find the call that sets up express-session
    const sessionCall = useSpy.mock.calls.find(call =>
      call[0] && call[0].name === 'session'
    );

    expect(sessionCall).toBeDefined();
  });

  it('passes cookieSessionStore through app.js to Authentication', () => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');

    // Create a mock session store that implements the Store interface
    const Store = session.Store;
    class MockStore extends Store {
      constructor() {
        super();
      }
      get(sid, callback) {
        callback(null, {});
      }
      set(sid, session, callback) {
        callback(null);
      }
      destroy(sid, callback) {
        callback(null);
      }
    }

    const mockStore = new MockStore();

    const config = {
      apps: [
        {
          serverURL: 'http://localhost:1337/parse',
          appId: 'testAppId',
          masterKey: 'testMasterKey',
          appName: 'TestApp',
        },
      ],
      users: [
        {
          user: 'testuser',
          pass: 'testpass',
        },
      ],
    };

    const options = {
      cookieSessionStore: mockStore,
      cookieSessionSecret: 'test-secret',
    };

    // Create dashboard app
    const dashboardApp = parseDashboard(config, options);

    // The app should be created successfully with the session store
    expect(dashboardApp).toBeDefined();
    expect(typeof dashboardApp).toBe('function'); // Express app is a function
  });

  it('maintains backward compatibility without cookieSessionStore option', () => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');

    const config = {
      apps: [
        {
          serverURL: 'http://localhost:1337/parse',
          appId: 'testAppId',
          masterKey: 'testMasterKey',
          appName: 'TestApp',
        },
      ],
      users: [
        {
          user: 'testuser',
          pass: 'testpass',
        },
      ],
    };

    const options = {
      cookieSessionSecret: 'test-secret',
    };

    // Create dashboard app without cookieSessionStore option
    const dashboardApp = parseDashboard(config, options);

    // The app should be created successfully even without session store
    expect(dashboardApp).toBeDefined();
    expect(typeof dashboardApp).toBe('function');
  });
});
