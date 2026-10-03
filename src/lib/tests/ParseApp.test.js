/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../ParseApp');

const Parse = require('parse');
const ParseApp = require('../ParseApp').default;

function newApp() {
  return new ParseApp({
    appName: 'test',
    appId: 'appId',
    supportedPushLocales: [],
  });
}

function mockFetchWithUser(username) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      headers: { get: header => (header === 'username' ? username : null) },
    })
  );
}

describe('ParseApp.runJob', () => {
  beforeEach(() => {
    Parse._request = jest.fn(() => Promise.resolve({}));
    window.PARSE_DASHBOARD_PATH = '/';
  });

  it('includes the dashboard user in the description when available', async () => {
    mockFetchWithUser('alice');
    await newApp().runJob({ jobName: 'myJob', params: '{}' });
    expect(Parse._request.mock.calls[0][2].description).toBe(
      'Executing from job schedule web console by alice.'
    );
  });

  it('falls back to the default description when no dashboard user is set', async () => {
    mockFetchWithUser(null);
    await newApp().runJob({ jobName: 'myJob', params: '{}' });
    expect(Parse._request.mock.calls[0][2].description).toBe(
      'Executing from job schedule web console.'
    );
  });

  it('falls back to the default description when the user lookup fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('network error')));
    await newApp().runJob({ jobName: 'myJob', params: '{}' });
    expect(Parse._request.mock.calls[0][2].description).toBe(
      'Executing from job schedule web console.'
    );
  });
});
