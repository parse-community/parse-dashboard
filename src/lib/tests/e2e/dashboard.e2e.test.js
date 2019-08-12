/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

jest.disableAutomock();

const express = require('express');
const ParseDashboard = require('../../../../Parse-Dashboard/app');
const puppeteer = require('puppeteer');

const dashboardSettings = {
  apps: [{
    serverURL: "http://localhost:5051/parse",
    appId: "appId",
    masterKey: "masterKey",
    appName: "MyApp"
  }]
};

// TODO: Mount parse-server
describe('dashboard e2e', () => {
  it('can keep mount path on redirect', async () => {
    let server;
    const mount = '/dashboard';
    const launchApp = new Promise(resolve => {
      const app = express();
      app.use(mount, ParseDashboard(dashboardSettings));
      server = app.listen(5051, resolve);
    });
    await launchApp;

    // // Should redirect to /dashboard/apps since there are no credentials
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(`http://localhost:5051${mount}`);
    await page.waitForSelector('#browser_mount');
console.log(page.url());
    expect(page.url().indexOf(`http://localhost:5051${mount}/apps`)).toBe(0);

    await page.close();
    await browser.close();
    server.close();
  });
});
