/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

jest.disableAutomock();

var express = require('express');
var rp = require('request-promise');
var ParseDashboard = require('../../../Parse-Dashboard/app');

var dashboardSettings = {
  'apps': [
    {
      'serverURL': 'http://localhost:5051/parse',
      'appId': 'appId',
      'masterKey': 'masterKey',
      'appName': 'MyApp'
    }
  ]
};

describe('e2e', () => {
  it('loads the dashboard on /dashboard', (done) => {
    let app = express();
    let server;
    var p = new Promise(resolve => {
      app.use('/dashboard', ParseDashboard(dashboardSettings));
      server = app.listen(5051, resolve);
    });
    return p.then(() => {
      return rp('http://localhost:5051/dashboard');
    })
    .then(result => {
      let bundleLocation = result.match(/<script src="([^"]*)">/)[1]
      return rp('http://localhost:5051' + bundleLocation);
    })
    .then(bundleText => {
      expect(bundleText.length).toBeGreaterThan(1000000);
      server.close(done);
    });
  });

  it('loads the dashboard on /', (done) => {
    let app = express();
    let server;
    var p = new Promise(resolve => {
      app.use('/', ParseDashboard(dashboardSettings));
      server = app.listen(5051, resolve);
    });
    return p.then(() => {
      return rp('http://localhost:5051');
    })
    .then(result => {
      let bundleLocation = result.match(/<script src="([^"]*)">/)[1]
      return rp('http://localhost:5051' + bundleLocation);
    })
    .then(bundleText => {
      expect(bundleText.length).toBeGreaterThan(1000000);
      server.close(done);
    });
  });
});
