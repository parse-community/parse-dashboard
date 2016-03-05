/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../prettyNumber');
const prettyNumber = require('../prettyNumber');

describe('prettyNumber', () => {
  it('does not change small numbers', () => {
    expect(prettyNumber(2)).toBe('2');
    expect(prettyNumber(42)).toBe('42');
  });

  it('abbreviates large numbers', () => {
    expect(prettyNumber(3333)).toBe('3.33k');
    expect(prettyNumber(10404)).toBe('10.4k');
    expect(prettyNumber(220022)).toBe('220k');
    expect(prettyNumber(220922)).toBe('221k');

    expect(prettyNumber(3333333)).toBe('3.33m');
    expect(prettyNumber(10404000)).toBe('10.4m');
    expect(prettyNumber(220022000)).toBe('220m');
    expect(prettyNumber(220922000)).toBe('221m');
  });

  it('allows a custom number of places', () => {
    expect(prettyNumber(3333, 4)).toBe('3333');
    expect(prettyNumber(10404, 4)).toBe('10.40k');
    expect(prettyNumber(10404, 5)).toBe('10404');
    expect(prettyNumber(10404, 6)).toBe('10404');
  });

  it('handles decimals', () => {
    expect(prettyNumber(0.13)).toBe('0.13');
    expect(prettyNumber(0.1466)).toBe('0.15');
    expect(prettyNumber(0.1466, 4)).toBe('0.147');

    expect(prettyNumber(10.14)).toBe('10.1');
    expect(prettyNumber(10.01, 6)).toBe('10.0100');
  });
});
