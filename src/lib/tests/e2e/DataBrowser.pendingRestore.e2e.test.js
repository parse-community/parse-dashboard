/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * E2E tests for the Data Browser "pendingRestore" feature: the selected cell
 * (by objectId and field name) is restored after a refresh. These tests drive
 * the real Parse Server, Dashboard, and DataBrowser in a browser so we
 * exercise the actual componentDidUpdate path instead of a mock.
 *
 * To run the full e2e (with Parse Server and MongoDB):
 *   MONGODB_URI=mongodb://localhost:27017/pending_restore_e2e \
 *   NODE_OPTIONS=--experimental-vm-modules \
 *   npx jest --testPathPatterns=DataBrowser.pendingRestore.e2e --forceExit
 *
 * Without MongoDB or the flag, the tests are skipped and pass (no assertions run).
 */

jest.disableAutomock();
jest.setTimeout(60_000);

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('../../../../Parse-Dashboard/app');
const puppeteer = require('puppeteer');
const Parse = require('parse/node');

const APP_ID = 'pendingRestoreE2EAppId';
const MASTER_KEY = 'masterKeyE2E';
const SERVER_PORT = 5150;
const DASH_PORT = 5151;
const SERVER_URL = `http://localhost:${SERVER_PORT}/parse`;
const MOUNT = '/dashboard';
const DASH_URL = `http://localhost:${DASH_PORT}${MOUNT}`;
const CLASS_NAME = 'PendingRestoreE2ETest';

let parseServerInstance;
let parseHttpServer;
let dashboardServer;
let browser;

async function startParseServer() {
  const api = new ParseServer({
    databaseURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pending_restore_e2e',
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL: SERVER_URL,
  });
  await api.start();
  const app = express();
  app.use('/parse', api.app);
  return new Promise((resolve, reject) => {
    parseHttpServer = app.listen(SERVER_PORT, () => {
      parseServerInstance = api;
      resolve();
    });
    parseHttpServer.on('error', reject);
  });
}

async function startDashboard() {
  const dashApp = express();
  dashApp.use(
    MOUNT,
    ParseDashboard(
      {
        apps: [
          {
            serverURL: SERVER_URL,
            appId: APP_ID,
            masterKey: MASTER_KEY,
            appName: 'TestApp',
          },
        ],
        trustProxy: 1,
      },
      { allowInsecureHTTP: true }
    )
  );
  return new Promise((resolve, reject) => {
    dashboardServer = dashApp.listen(DASH_PORT, resolve);
    dashboardServer.on('error', reject);
  });
}

async function seedTestObject() {
  Parse.initialize(APP_ID, undefined, MASTER_KEY);
  Parse.serverURL = SERVER_URL;
  const obj = new Parse.Object(CLASS_NAME);
  obj.set('title', 'E2E Hello');
  obj.set('count', 42);
  await obj.save(null, { useMasterKey: true });
  return obj.id;
}

let e2eSkipped = false;

function shouldSkipE2E(err) {
  const msg = err && (err.message || err.toString());
  if (
    msg &&
    (msg.includes('connect ECONNREFUSED') ||
      msg.includes('MongoServerSelectionError') ||
      msg.includes('MongoNetworkError'))
  ) {
    console.warn('DataBrowser.pendingRestore e2e: MongoDB not available, skipping.');
    return true;
  }
  if (msg && msg.includes('experimental-vm-modules')) {
    console.warn(
      'DataBrowser.pendingRestore e2e: Run with NODE_OPTIONS=--experimental-vm-modules and MongoDB for full e2e.'
    );
    return true;
  }
  return false;
}

beforeAll(async () => {
  try {
    await startParseServer();
  } catch (e) {
    if (shouldSkipE2E(e)) {
      e2eSkipped = true;
      return;
    }
    throw e;
  }
  await startDashboard();
  Parse.initialize(APP_ID, undefined, MASTER_KEY);
  Parse.serverURL = SERVER_URL;
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
  if (dashboardServer) {
    await new Promise(resolve => dashboardServer.close(resolve));
  }
  if (parseHttpServer) {
    await new Promise(resolve => parseHttpServer.close(resolve));
  }
  if (parseServerInstance && typeof parseServerInstance.handleShutdown === 'function') {
    await parseServerInstance.handleShutdown();
  }
});

describe('DataBrowser pendingRestore e2e', () => {
  it('keeps the correct cell selected after a data refresh', async () => {
    if (e2eSkipped || !parseServerInstance) {
      return;
    }
    const objectId = await seedTestObject();
    const page = await browser.newPage();

    await page.goto(`${DASH_URL}/apps/TestApp/browser/${CLASS_NAME}`, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    await page.waitForSelector('[data-object-id]', { timeout: 10000 });

    const cellSelector = `[data-object-id="${objectId}"][data-field="title"]`;
    await page.waitForSelector(cellSelector, { timeout: 5000 });
    await page.click(cellSelector);

    const hasCurrentBefore = (await page.$('[data-current-cell="true"]')) !== null;
    expect(hasCurrentBefore).toBe(true);

    const refreshByText = await page.$x("//a[.//span[text()='Refresh']]").then(nodes => nodes[0]);
    expect(refreshByText).toBeTruthy();
    await refreshByText.click();

    await page.waitForSelector('[data-object-id]', { timeout: 10000 });

    const hasCurrentAfter = (await page.$('[data-current-cell="true"]')) !== null;
    expect(hasCurrentAfter).toBe(true);

    const currentCell = await page.$('[data-current-cell="true"]');
    expect(currentCell).toBeTruthy();
    const dataObjectId = await currentCell.evaluate(el => el.getAttribute('data-object-id'));
    const dataField = await currentCell.evaluate(el => el.getAttribute('data-field'));
    expect(dataObjectId).toBe(objectId);
    expect(dataField).toBe('title');

    await page.close();
  });

  it('clears selection when the object no longer exists after refresh', async () => {
    if (e2eSkipped || !parseServerInstance) {
      return;
    }
    const objectId = await seedTestObject();
    const page = await browser.newPage();

    await page.goto(`${DASH_URL}/apps/TestApp/browser/${CLASS_NAME}`, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });
    await page.waitForSelector('[data-object-id]', { timeout: 10000 });

    const cellSelector = `[data-object-id="${objectId}"][data-field="title"]`;
    await page.waitForSelector(cellSelector, { timeout: 5000 });
    await page.click(cellSelector);

    const obj = await new Parse.Query(CLASS_NAME).get(objectId, { useMasterKey: true });
    await obj.destroy({ useMasterKey: true });

    const refreshByText = await page.$x("//a[.//span[text()='Refresh']]").then(nodes => nodes[0]);
    expect(refreshByText).toBeTruthy();
    await refreshByText.click();

    await page.waitForSelector('[data-object-id]', { timeout: 10000 });

    const anyCurrent = (await page.$('[data-current-cell="true"]')) !== null;
    expect(anyCurrent).toBe(false);

    await page.close();
  });
});
