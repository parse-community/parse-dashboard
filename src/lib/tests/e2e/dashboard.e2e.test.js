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


describe('port, config, appId, serverURL, masterKey, appName, graphQLServerURL options should not be ignored.', () => {
  it('Should start with port 4041.', async () => {
    const result = await startParseDashboardAndGetOutput(['--port', '4041']);

    expect(result).toContain('The dashboard is now available at http://0.0.0.0:4041/');
  });

  it('Should return an error message if config and appId options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--appId', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and serverURL options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--serverURL', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and masterKey options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--masterKey', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and appName options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--appName', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });

  it('Should return an error message if config and graphQLServerURL options are provided together.', async () => {
    const result = await startParseDashboardAndGetOutput(['--config', 'helloworld', '--graphQLServerURL', 'helloworld']);

    expect(result).toContain('You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.');
  });
});

function startParseDashboardAndGetOutput(args) {
  const TIMEOUT = 1000; // ms
  return new Promise((resolve) => {
    const indexFilePath = path.resolve('./Parse-Dashboard/index.js');
    const child = spawn('node', [indexFilePath, ...args], { cwd: '.', timeout: TIMEOUT });
    setTimeout(() => { child.kill(); }, TIMEOUT); // node.js 12 hack (spawn timeout option is not supported.)

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
