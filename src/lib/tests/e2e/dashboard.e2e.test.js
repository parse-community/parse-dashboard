/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

jest.disableAutomock();

const express = require('express');
const path = require('path');
const spawn = require('child_process').spawn;
const ParseDashboard = require('../../../../Parse-Dashboard/app');
const puppeteer = require('puppeteer');

const dashboardSettings = {
  apps: [{
    serverURL: 'http://localhost:5051/parse',
    appId: 'appId',
    masterKey: 'masterKey',
    appName: 'MyApp'
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
    expect(page.url().indexOf(`http://localhost:5051${mount}/apps`)).toBe(0);

    await page.close();
    await browser.close();
    server.close();
  });
});


describe('Config options', () => {
  it('should start with port option', async () => {
    const result = await startParseDashboardAndGetOutput(['--port', '4041']);
    expect(result).toContain('The dashboard is now available at http://0.0.0.0:4041/');
  });

  it('should reject to start if config and other options are combined', async () => {
    const args = [
      '--appId',
      '--serverURL',
      '--masterKey',
      '--appName',
      '--graphQLServerURL'
    ];

    for (const arg of args) {
      const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', arg, 'helloworld']);
      expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
    }
  });
});

function startParseDashboardAndGetOutput(args) {
  const timeoutInMs = 1000;
  return new Promise((resolve) => {
    const indexFilePath = path.resolve('./Parse-Dashboard/index.js');
    const child = spawn('node', [indexFilePath, ...args], { cwd: '.', timeout: timeoutInMs });

    let output = '';
    child.on('error', () => { resolve(output); });
    child.on('close', () => { resolve(output); });

    if (child.stdout) {
      child.stdout.on('data', data => {
        output += `STDOUT: ${data}\n`;
      });
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        output += `STDERROR: ${data}\n`;
      });
    }
  });
}
