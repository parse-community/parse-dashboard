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

const MASTER_KEY = 'testMasterKey';
const SESSION_SECRET = 'test-secret';

/**
 * Helper to make HTTP requests to the test server. Requests always originate
 * from loopback, which is what a reverse proxy running on the same host as the
 * dashboard looks like from the dashboard's point of view.
 */
function makeRequest(port, { method = 'GET', path = '/', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = { hostname: '127.0.0.1', port, path, method, headers: { ...headers } };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
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
        resolve({ status: res.statusCode, body: json, raw: data });
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
 * Build a dashboard config without users, which is the configuration that
 * limits no-auth access to localhost.
 */
function noUserConfig(overrides = {}) {
  return {
    apps: [
      {
        serverURL: 'http://localhost:1337/parse',
        appId: 'testAppId',
        masterKey: MASTER_KEY,
        appName: 'TestApp',
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
    ...overrides,
  };
}

/**
 * Start the dashboard mounted in a parent app, as the CLI and the express
 * middleware integration both do.
 */
function startDashboard(config, options = {}) {
  return new Promise((resolve) => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');
    const parentApp = express();
    parentApp.use(
      '/',
      parseDashboard(config, { cookieSessionSecret: SESSION_SECRET, ...options })
    );

    const server = parentApp.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

function stopDashboard(server) {
  return new Promise((resolve) => (server ? server.close(resolve) : resolve()));
}

describe('Config endpoint locality — requests forwarded by a same-host proxy', () => {
  let server;
  let port;

  beforeAll(async () => {
    ({ server, port } = await startDashboard(noUserConfig(), { allowInsecureHTTP: true }));
  });

  afterAll(() => stopDashboard(server));

  it('does not return the master key for a request carrying X-Forwarded-For', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-For': '203.0.113.7' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key for a request carrying X-Real-IP', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Real-IP': '203.0.113.7' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key for a request carrying X-Forwarded-Host', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-Host': 'dashboard.example.com' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key for a request carrying only X-Forwarded-Proto', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-Proto': 'https' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key for a request carrying only X-Forwarded-Port', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-Port': '443' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key for a request carrying a Forwarded header', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { Forwarded: 'for=203.0.113.7;proto=https;host=dashboard.example.com' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });
});

describe('Config endpoint locality — requests forwarded by a same-host proxy over HTTPS', () => {
  let server;
  let port;

  beforeAll(async () => {
    ({ server, port } = await startDashboard(noUserConfig({ trustProxy: 1 })));
  });

  afterAll(() => stopDashboard(server));

  it('does not return the master key when the proxy reports a secure connection', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-For': '203.0.113.7', 'X-Forwarded-Proto': 'https' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });

  it('does not return the master key when a proxy is trusted but sends no forwarding headers', async () => {
    const res = await makeRequest(port, { path: '/parse-dashboard-config.json' });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.body.error).toBeDefined();
  });
});

describe('Config endpoint locality — genuine localhost requests', () => {
  let server;
  let port;

  beforeAll(async () => {
    ({ server, port } = await startDashboard(noUserConfig()));
  });

  afterAll(() => stopDashboard(server));

  it('returns the master key for a loopback request without forwarding headers', async () => {
    const res = await makeRequest(port, { path: '/parse-dashboard-config.json' });

    expect(res.status).toBe(200);
    expect(res.body.apps[0].masterKey).toBe(MASTER_KEY);
  });
});

describe('Config endpoint locality — configured deployments behind a proxy', () => {
  let server;
  let port;

  const withUsers = {
    apps: [
      {
        serverURL: 'http://localhost:1337/parse',
        appId: 'testAppId',
        masterKey: MASTER_KEY,
        appName: 'TestApp',
      },
    ],
    users: [{ user: 'admin', pass: 'admin' }],
  };

  beforeAll(async () => {
    ({ server, port } = await startDashboard(withUsers));
  });

  afterAll(() => stopDashboard(server));

  // The HTTPS requirement is keyed on the connection, not on the client, so a
  // proxy terminating TLS on this host keeps working without `trustProxy`.
  it('does not impose the HTTPS requirement on a proxy terminating TLS on this host', async () => {
    const res = await makeRequest(port, {
      path: '/parse-dashboard-config.json',
      headers: { 'X-Forwarded-For': '203.0.113.7', 'X-Forwarded-Proto': 'https' },
    });

    expect(res.raw).not.toContain(MASTER_KEY);
    expect(res.raw).not.toContain('can only be remotely accessed via HTTPS');
    expect(res.status).toBe(401);
  });
});

describe('Agent endpoint locality — requests forwarded by a same-host proxy', () => {
  let server;
  let port;

  beforeAll(async () => {
    ({ server, port } = await startDashboard(noUserConfig(), { allowInsecureHTTP: true }));
  });

  afterAll(() => stopDashboard(server));

  it('rejects a forwarded request in no-user mode', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      path: '/apps/TestApp/agent',
      body: { message: 'List all classes', modelName: 'test-model' },
      headers: { 'X-Forwarded-For': '203.0.113.7' },
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Configure a user to access Parse Dashboard remotely');
  });
});
