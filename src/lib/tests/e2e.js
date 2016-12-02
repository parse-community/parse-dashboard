/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

jest.disableAutomock();

var express = require('express');
var app = express();
var rp = require('request-promise');
var ParseDashboard = require('../../../Parse-Dashboard/app');

var dashboard = ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:5051/parse",
      "appId": "appId",
      "masterKey": "masterKey",
      "appName": "MyApp"
    }
  ]
});

app.use('/dashboard', dashboard);

var p = new Promise(resolve => {
  app.listen(5051, resolve);
});

describe('e2e', () => {
  it('loads the dashboard', () => {
    return p.then(() => {
      return rp('http://localhost:5051/dashboard');
    })
    .then(result => {
      let bundleLocation = result.match(/<script src=\"([^\"]*)\">/)[1]
      return rp('http://localhost:5051' + bundleLocation);
    })
    .then(bundleText => {
      expect(bundleText.length).toBeGreaterThan(1000000);
    });
  });
});
