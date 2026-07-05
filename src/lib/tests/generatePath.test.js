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
jest.dontMock('../generatePath');

function loadGeneratePath(mountPath) {
  if (mountPath === undefined) {
    delete window.PARSE_DASHBOARD_PATH;
  } else {
    window.PARSE_DASHBOARD_PATH = mountPath;
  }
  let generatePath;
  jest.isolateModules(() => {
    generatePath = require('../generatePath').default;
  });
  return generatePath;
}

const app = { slug: 'myApp' };

describe('generatePath', () => {
  it('returns a root-relative path by default, regardless of mount path', () => {
    const generatePath = loadGeneratePath('/dashboard/');
    expect(generatePath(app, 'browser/_User')).toBe('/apps/myApp/browser/_User');
  });

  it('prepends the mount path when prependMountPath is true and a mount path is set', () => {
    const generatePath = loadGeneratePath('/dashboard/');
    expect(generatePath(app, 'browser/_User', true)).toBe('/dashboard/apps/myApp/browser/_User');
  });

  it('falls back to a root-relative path when prependMountPath is true but no mount path is set', () => {
    const generatePath = loadGeneratePath(undefined);
    expect(generatePath(app, 'browser/_User', true)).toBe('/apps/myApp/browser/_User');
  });
});
