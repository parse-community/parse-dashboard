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
  apps: [
    {
      serverURL: 'http://localhost:5051/parse',
      appId: 'appId',
      masterKey: 'masterKey',
      appName: 'MyApp',
    },
  ],
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
  }, 20_000);

  it('mounts the login entry into #login_mount when users are configured', async () => {
    const mount = '/dashboard';
    // The login page is only served when users are configured (see Parse-Dashboard/app.js).
    const settingsWithUsers = {
      ...dashboardSettings,
      cookieSessionSecret: 'e2e-login-test-secret',
      users: [{ user: 'admin', pass: 'admin' }],
    };
    const app = express();
    app.use(mount, ParseDashboard(settingsWithUsers));
    // Listen on an ephemeral port and reject on error so a busy/leaked port
    // fails fast instead of hanging until the test timeout.
    const server = await new Promise((resolve, reject) => {
      // Bind explicitly to 127.0.0.1 (matched by the goto below) so the server
      // and Puppeteer agree on the interface — Node 17+ verbatim DNS can resolve
      // `localhost` to ::1 while the server binds IPv4, causing ECONNREFUSED.
      const s = app.listen(0, '127.0.0.1', () => resolve(s)).on('error', reject);
    });
    const port = server.address().port;
    // try/finally (with puppeteer launched inside) so a regression (empty mount)
    // or a launch failure fails cleanly instead of leaking the browser/server.
    let browser;
    try {
      browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}${mount}/login`);
      await page.waitForSelector('#login_mount');
      // React must actually render into the mount node. This guards the login entry
      // point against the React 19 removal of ReactDOM.render (it uses createRoot);
      // a regression there leaves #login_mount empty (blank page) rather than failing the build.
      await page.waitForFunction(
        () => {
          const el = document.getElementById('login_mount');
          return !!el && el.childElementCount > 0;
        },
        { timeout: 10_000 }
      );
      const childCount = await page.evaluate(
        () => document.getElementById('login_mount').childElementCount
      );
      expect(childCount).toBeGreaterThan(0);
    } finally {
      // Nested finally + awaited close so a browser.close() failure cannot skip
      // server.close() and leak the Express server (which would hang the run).
      try {
        if (browser) {
          await browser.close();
        }
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    }
  }, 20_000);
});

describe('Config options', () => {
  it('should start with port option', async () => {
    const result = await startParseDashboardAndGetOutput(['--port', '4041']);
    expect(result).toContain('The dashboard is now available at http://localhost:4041/');
  });

  it('should reject to start if config and other options are combined', async () => {
    const args = ['--appId', '--serverURL', '--masterKey', '--appName', '--graphQLServerURL'];

    for (const arg of args) {
      const result = await startParseDashboardAndGetOutput([
        '--config',
        'helloworld',
        arg,
        'helloworld',
      ]);
      expect(result).toContain(
        'You must provide either a config file or other CLI options (appName, appId, masterKey, serverURL, and graphQLServerURL); not both.'
      );
    }
  });
});

function startParseDashboardAndGetOutput(args) {
  const timeoutInMs = 1000;
  return new Promise(resolve => {
    const indexFilePath = path.resolve('./Parse-Dashboard/index.js');
    const child = spawn('node', [indexFilePath, ...args], {
      cwd: '.',
      timeout: timeoutInMs,
    });

    let output = '';
    child.on('error', () => {
      resolve(output);
    });
    child.on('close', () => {
      resolve(output);
    });

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
