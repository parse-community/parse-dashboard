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

const SESSION_SECRET = 'test-secret';

/**
 * Fetch the login page, which is the only page that carries the OTP
 * auto-submit flag.
 */
function getLoginPage(port) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path: '/login', method: 'GET' },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, raw: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

/**
 * Build a dashboard config with users, since the login page is only served
 * when users are configured.
 */
function configWithUsers(overrides = {}) {
  return {
    apps: [
      {
        serverURL: 'http://localhost:1337/parse',
        appId: 'testAppId',
        masterKey: 'testMasterKey',
        appName: 'TestApp',
      },
    ],
    users: [{ user: 'admin', pass: 'admin' }],
    ...overrides,
  };
}

function startDashboard(config) {
  return new Promise(resolve => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');
    const parentApp = express();
    parentApp.use('/', parseDashboard(config, { cookieSessionSecret: SESSION_SECRET }));

    const server = parentApp.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

function stopDashboard(server) {
  return new Promise(resolve => (server ? server.close(resolve) : resolve()));
}

describe('OTP auto-submit option', () => {
  let server;

  afterEach(async () => {
    await stopDashboard(server);
    server = undefined;
  });

  it('enables auto-submit when the option is not set', async () => {
    let port;
    ({ server, port } = await startDashboard(configWithUsers()));

    const res = await getLoginPage(port);

    expect(res.status).toBe(200);
    expect(res.raw).toContain('PARSE_DASHBOARD_OTP_AUTO_SUBMIT = true;');
  });

  it('enables auto-submit when the option is set to true', async () => {
    let port;
    ({ server, port } = await startDashboard(configWithUsers({ otpAutoSubmit: true })));

    const res = await getLoginPage(port);

    expect(res.raw).toContain('PARSE_DASHBOARD_OTP_AUTO_SUBMIT = true;');
  });

  it('disables auto-submit when the option is set to false', async () => {
    let port;
    ({ server, port } = await startDashboard(configWithUsers({ otpAutoSubmit: false })));

    const res = await getLoginPage(port);

    expect(res.raw).toContain('PARSE_DASHBOARD_OTP_AUTO_SUBMIT = false;');
  });
});
