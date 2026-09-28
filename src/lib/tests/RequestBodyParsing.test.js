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

const SESSION_SECRET = 'test-secret';
const CSRF_TOKEN = 'test-csrf-token';

/**
 * Helper to send a request with a raw body and an explicit content type.
 */
function makeRequest(
  port,
  { method = 'POST', path = '/', body, contentType, cookie = null, headers = {} }
) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
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
    req.write(body);
    req.end();
  });
}

/**
 * In-memory session store with pre-populated sessions.
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
 * Build session data holding a CSRF token and, optionally, a logged in user.
 */
function buildSessionData(username) {
  const data = {
    cookie: {
      originalMaxAge: null,
      expires: null,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
    csrfToken: CSRF_TOKEN,
  };
  if (username) {
    data.passport = { user: username };
  }
  return JSON.stringify(data);
}

describe('Request body parsing', () => {
  let server;
  let port;

  const dashboardConfig = {
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
        user: 'admin',
        pass: 'password123',
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

  // A successful login regenerates the session, so each login test uses its own session.
  const mockStore = new MockSessionStore({
    'admin-session': buildSessionData('admin'),
    'login-success-session': buildSessionData(),
    'login-failure-session': buildSessionData(),
  });

  const adminCookie = buildSessionCookie('admin-session', SESSION_SECRET);

  beforeAll(done => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');
    const dashboardApp = parseDashboard(dashboardConfig, {
      cookieSessionSecret: SESSION_SECRET,
      cookieSessionStore: mockStore,
    });

    const parentApp = express();
    parentApp.use('/', dashboardApp);

    server = parentApp.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      done();
    });
  });

  afterAll(done => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  it('parses a JSON body', async () => {
    const res = await makeRequest(port, {
      path: '/apps/TestApp/agent',
      contentType: 'application/json',
      body: JSON.stringify({ message: 'List all classes' }),
      cookie: adminCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    // The message is read from the body, so validation fails on the missing model name next.
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Model name is required' });
  });

  it('parses a URL-encoded body as sent by the dashboard AJAX helper', async () => {
    const res = await makeRequest(port, {
      path: '/apps/TestApp/agent',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      body: 'message=' + encodeURIComponent('List all classes'),
      cookie: adminCookie,
      headers: { 'X-CSRF-Token': CSRF_TOKEN },
    });
    // The message is read from the body, so validation fails on the missing model name next.
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Model name is required' });
  });

  it('parses a URL-encoded login form with valid credentials', async () => {
    const res = await makeRequest(port, {
      path: '/login',
      contentType: 'application/x-www-form-urlencoded',
      body: new URLSearchParams({
        _csrf: CSRF_TOKEN,
        username: 'admin',
        password: 'password123',
      }).toString(),
      cookie: buildSessionCookie('login-success-session', SESSION_SECRET),
    });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/apps');
  });

  it('parses a URL-encoded login form with invalid credentials', async () => {
    const res = await makeRequest(port, {
      path: '/login',
      contentType: 'application/x-www-form-urlencoded',
      body: new URLSearchParams({
        _csrf: CSRF_TOKEN,
        username: 'admin',
        password: 'wrong-password',
      }).toString(),
      cookie: buildSessionCookie('login-failure-session', SESSION_SECRET),
    });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});
