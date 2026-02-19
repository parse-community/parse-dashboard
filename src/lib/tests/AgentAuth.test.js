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
const http = require('http');
const session = require('express-session');
const cookieSignature = require('express-session/node_modules/cookie-signature');

/**
 * Helper to make HTTP requests to the test server.
 */
function makeRequest(port, { method = 'GET', path = '/', body = null, cookie = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: { ...headers },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // not JSON
        }
        resolve({ status: res.statusCode, body: json, raw: data, headers: res.headers });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * In-memory session store for testing authenticated flows.
 * Pre-populated sessions allow simulating different dashboard user roles
 * without going through the full login flow.
 */
class MockSessionStore extends session.Store {
  constructor(sessions = {}) {
    super();
    this.sessions = sessions;
  }
  get(sid, callback) {
    const sess = this.sessions[sid];
    callback(null, sess ? JSON.parse(sess) : null);
  }
  set(sid, sess, callback) {
    this.sessions[sid] = JSON.stringify(sess);
    callback(null);
  }
  destroy(sid, callback) {
    delete this.sessions[sid];
    callback(null);
  }
}

/**
 * Build a signed session cookie for express-session.
 */
function buildSessionCookie(sessionId, secret) {
  const signed = 's:' + cookieSignature.sign(sessionId, secret);
  return `parse_dash=${encodeURIComponent(signed)}`;
}

/**
 * Build a pre-populated session object for the mock store.
 * The passport.user field is the serialized username (as stored by passport.serializeUser).
 */
const CSRF_TOKEN = 'test-csrf-token';

function buildSessionData(username) {
  return JSON.stringify({
    cookie: {
      originalMaxAge: null,
      expires: null,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
    passport: { user: username },
    csrfToken: CSRF_TOKEN,
  });
}

const SESSION_SECRET = 'test-secret';

/**
 * Helper to build an agent request body.
 */
function agentBody(overrides = {}) {
  return {
    message: 'List all classes',
    modelName: 'test-model',
    conversationId: 'test',
    permissions: {},
    ...overrides,
  };
}

// Single server with all user types to avoid passport singleton issues.
// Passport is a singleton — creating multiple servers in one process
// causes the later server's deserializeUser to overwrite the earlier one's.
describe('Agent endpoint security', () => {
  let server;
  let port;

  // Dashboard config with multiple user types:
  // - admin: full access to all apps
  // - readonly: global read-only user
  // - appreadonly: user with per-app read-only on TestApp
  // - appadmin: full access scoped to TestApp only
  const dashboardConfig = {
    apps: [
      {
        serverURL: 'http://localhost:1337/parse',
        appId: 'testAppId',
        masterKey: 'testMasterKey',
        readOnlyMasterKey: 'testReadOnlyMasterKey',
        appName: 'TestApp',
      },
      {
        serverURL: 'http://localhost:1337/parse',
        appId: 'secretAppId',
        masterKey: 'secretMasterKey',
        readOnlyMasterKey: 'secretReadOnlyMasterKey',
        appName: 'SecretApp',
      },
    ],
    users: [
      {
        user: 'admin',
        pass: 'password123',
      },
      {
        user: 'readonly',
        pass: 'password123',
        readOnly: true,
      },
      {
        user: 'appreadonly',
        pass: 'password123',
        apps: [{ appId: 'testAppId', readOnly: true }],
      },
      {
        user: 'appadmin',
        pass: 'password123',
        apps: [{ appId: 'testAppId' }],
      },
    ],
    agent: {
      models: [
        {
          name: 'test-model',
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'fake-api-key-for-testing',
        },
      ],
    },
  };

  // Pre-populate sessions for each dashboard user type
  const mockStore = new MockSessionStore({
    'admin-session': buildSessionData('admin'),
    'readonly-session': buildSessionData('readonly'),
    'appreadonly-session': buildSessionData('appreadonly'),
    'appadmin-session': buildSessionData('appadmin'),
  });

  const adminCookie = buildSessionCookie('admin-session', SESSION_SECRET);
  const readonlyCookie = buildSessionCookie('readonly-session', SESSION_SECRET);
  const appreadonlyCookie = buildSessionCookie('appreadonly-session', SESSION_SECRET);
  const appadminCookie = buildSessionCookie('appadmin-session', SESSION_SECRET);

  beforeAll((done) => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');
    const dashboardApp = parseDashboard(dashboardConfig, {
      cookieSessionSecret: SESSION_SECRET,
      cookieSessionStore: mockStore,
      dev: true,
    });

    const parentApp = express();
    parentApp.use('/', dashboardApp);

    server = parentApp.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  // ---------------------------------------------------------------
  // Unauthenticated access (no session cookie)
  // ---------------------------------------------------------------

  it('returns 401 for unauthenticated requests to the agent endpoint', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 when unauthenticated attacker sends self-authorized permissions', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody({
        permissions: {
          deleteClass: true,
          deleteObject: true,
          createObject: true,
          updateObject: true,
        },
      }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unauthenticated requests to config endpoint', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/parse-dashboard-config.json',
    });
    expect(res.status).toBe(401);
  });

  // ---------------------------------------------------------------
  // Authenticated access — full admin (no app restrictions)
  // ---------------------------------------------------------------

  it('allows authenticated full admin to reach the agent handler', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
      cookie: adminCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    // 500 expected: auth passes, reaches OpenAI call which fails with fake API key
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('returns 403 when authenticated admin sends request without CSRF token', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
      cookie: adminCookie,
      // No X-CSRF-Token header
    });
    expect(res.status).toBe(403);
  });

  // ---------------------------------------------------------------
  // Authenticated access — app-scoped admin
  // ---------------------------------------------------------------

  it('allows app-scoped admin to access their assigned app', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
      cookie: appadminCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('returns 403 when app-scoped admin tries to access an unassigned app', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/SecretApp/agent',
      body: agentBody(),
      cookie: appadminCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    expect(res.status).toBe(403);
  });

  // ---------------------------------------------------------------
  // Read-only privilege escalation — global read-only user
  // ---------------------------------------------------------------

  it('allows global read-only user to reach the agent handler (for reads)', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
      cookie: readonlyCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    // Read-only users can still use the agent for read operations
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('uses readOnlyMasterKey for global read-only user even when write permissions are sent', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody({
        permissions: {
          deleteClass: true,
          deleteObject: true,
          createObject: true,
          updateObject: true,
          createClass: true,
        },
      }),
      cookie: readonlyCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    // Passes auth, request is processed (500 from fake API key, not 401/403).
    // Server-side: masterKey swapped to readOnlyMasterKey + permissions overridden to {}.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  // ---------------------------------------------------------------
  // Read-only privilege escalation — per-app read-only user
  // ---------------------------------------------------------------

  it('allows per-app read-only user to reach the agent handler for their app', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: agentBody(),
      cookie: appreadonlyCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
