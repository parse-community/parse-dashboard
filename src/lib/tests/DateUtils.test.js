/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { isDate, shortMonth, nextMonth, prevMonth, daysInMonth } from '../DateUtils';

describe('isDate', () => {
  it('only returns true for Date objects', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(12)).toBe(false);
    expect(isDate({})).toBe(false);
  });
});

describe('shortMonth', () => {
  it('provides appropriate shortened versions', () => {
    expect(shortMonth(0)).toBe('Jan');
    expect(shortMonth(1)).toBe('Feb');
    expect(shortMonth(5)).toBe('June');
    expect(shortMonth(6)).toBe('July');
    expect(shortMonth(8)).toBe('Sept');
  });

  it('does not fail on invalid months', () => {
    expect(shortMonth(-1)).toBe('');
    expect(shortMonth(12)).toBe('');
  });
});

describe('nextMonth', () => {
  it('returns the first day of the next month', () => {
    let start = new Date(2001, 2, 3, 4, 5, 6);
    let next = nextMonth(start);
    expect(next.getFullYear()).toBe(2001);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(1);
    expect(next.getHours()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getSeconds()).toBe(0);
  });
});

describe('prevMonth', () => {
  it('returns the first day of the previous month', () => {
    let start = new Date(2001, 2, 3, 4, 5, 6);
    let next = prevMonth(start);
    expect(next.getFullYear()).toBe(2001);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
    expect(next.getHours()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getSeconds()).toBe(0);
  });
});

describe('daysInMonth', () => {
  it('returns the days in each month', () => {
    expect(daysInMonth(new Date(2015, 0))).toBe(31);
    expect(daysInMonth(new Date(2015, 1))).toBe(28);
    expect(daysInMonth(new Date(2012, 1))).toBe(29);
    expect(daysInMonth(new Date(2015, 8))).toBe(30);
  });
});
