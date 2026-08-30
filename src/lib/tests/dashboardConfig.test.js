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

function getConfig(port) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path: '/parse-dashboard-config.json', method: 'GET' },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let body = null;
          try {
            body = JSON.parse(data);
          } catch {
            body = data;
          }
          resolve({ status: res.statusCode, body });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

describe('/parse-dashboard-config.json app field whitelist', () => {
  let server;
  let port;

  // A circular object, as produced by a real filesAdapter instance (e.g. a Mongo topology).
  const filesAdapter = {};
  filesAdapter.self = filesAdapter;

  const dashboardConfig = {
    apps: [
      {
        appId: 'testAppId',
        appName: 'TestApp',
        masterKey: 'testMasterKey',
        serverURL: 'http://localhost:1337/parse',
        infoPanel: [{ title: 'Panel', classes: ['_User'], cloudCodeFunction: 'fn' }],
        config: { className: '_User' },
        // Server-only fields a user may have pasted from their Parse Server config:
        readOnlyMasterKey: 'testReadOnlyMasterKey',
        masterKeyTtl: 3600,
        databaseURI: 'mongodb://localhost:27017/dev',
        filesAdapter,
      },
    ],
  };

  beforeAll(done => {
    const parseDashboard = require('../../../Parse-Dashboard/app.js');
    const dashboardApp = parseDashboard(dashboardConfig, {
      cookieSessionSecret: 'test-secret',
      dev: true,
    });
    const parentApp = express();
    parentApp.use('/', dashboardApp);
    server = parentApp.listen(0, () => {
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

  it('responds without crashing when an app config contains a circular filesAdapter', async () => {
    const res = await getConfig(port);
    expect(res.status).toBe(200);
  });

  it('sends the whitelisted client fields', async () => {
    const { body } = await getConfig(port);
    const app = body.apps[0];
    expect(app.appId).toBe('testAppId');
    expect(app.appName).toBe('TestApp');
    expect(app.masterKey).toBe('testMasterKey');
    expect(app.serverURL).toBe('http://localhost:1337/parse');
    expect(app.infoPanel).toEqual([
      { title: 'Panel', classes: ['_User'], cloudCodeFunction: 'fn' },
    ]);
    expect(app.config).toEqual({ className: '_User' });
  });

  it('strips server-only fields from the response', async () => {
    const { body } = await getConfig(port);
    const app = body.apps[0];
    expect(app).not.toHaveProperty('filesAdapter');
    expect(app).not.toHaveProperty('databaseURI');
    expect(app).not.toHaveProperty('readOnlyMasterKey');
    expect(app).not.toHaveProperty('masterKeyTtl');
  });
});
