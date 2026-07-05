/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../decodeConfigValue');

const decodeConfigValue = require('../decodeConfigValue').default;
const Parse = require('parse');

describe('decodeConfigValue', () => {
  it('rehydrates a wire-format Date into a Date instance', () => {
    const result = decodeConfigValue({ __type: 'Date', iso: '2024-05-05T00:36:00.000Z' });
    expect(result instanceof Date).toBe(true);
    expect(result.toISOString()).toBe('2024-05-05T00:36:00.000Z');
  });

  it('passes a real Date through unchanged', () => {
    const d = new Date('2024-05-05T00:36:00.000Z');
    expect(decodeConfigValue(d)).toBe(d);
  });

  it('rehydrates a File wire object', () => {
    const result = decodeConfigValue({ __type: 'File', name: 'f.png', url: 'https://x/f.png' });
    expect(result instanceof Parse.File).toBe(true);
  });

  it('rehydrates a GeoPoint wire object', () => {
    const result = decodeConfigValue({ __type: 'GeoPoint', latitude: 1, longitude: 2 });
    expect(result instanceof Parse.GeoPoint).toBe(true);
  });

  it('passes primitives through', () => {
    expect(decodeConfigValue('x')).toBe('x');
    expect(decodeConfigValue(42)).toBe(42);
  });
});
