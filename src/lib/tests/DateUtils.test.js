/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../DateUtils');
const DateUtils = require('../DateUtils');

describe('isDate', () => {
  it('only returns true for Date objects', () => {
    expect(DateUtils.isDate(new Date())).toBe(true);
    expect(DateUtils.isDate(12)).toBe(false);
    expect(DateUtils.isDate({})).toBe(false);
  });
});

describe('shortMonth', () => {
  it('provides appropriate shortened versions', () => {
    expect(DateUtils.shortMonth(0)).toBe('Jan');
    expect(DateUtils.shortMonth(1)).toBe('Feb');
    expect(DateUtils.shortMonth(5)).toBe('June');
    expect(DateUtils.shortMonth(6)).toBe('July');
    expect(DateUtils.shortMonth(8)).toBe('Sept');
  });

  it('does not fail on invalid months', () => {
    expect(DateUtils.shortMonth(-1)).toBe('');
    expect(DateUtils.shortMonth(12)).toBe('');
  });
});

describe('nextMonth', () => {
  it('returns the first day of the next month', () => {
    const start = new Date(2001, 2, 3, 4, 5, 6);
    const next = DateUtils.nextMonth(start);
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
    const start = new Date(2001, 2, 3, 4, 5, 6);
    const next = DateUtils.prevMonth(start);
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
    expect(DateUtils.daysInMonth(new Date(2015, 0))).toBe(31);
    expect(DateUtils.daysInMonth(new Date(2015, 1))).toBe(28);
    expect(DateUtils.daysInMonth(new Date(2012, 1))).toBe(29);
    expect(DateUtils.daysInMonth(new Date(2015, 8))).toBe(30);
  });
});

describe('dateStringUTC', () => {
  const date = new Date('2020-01-15T13:45:30Z');

  it('formats in UTC by default', () => {
    expect(DateUtils.dateStringUTC(date)).toBe('15 Jan 2020, 13:45:30 UTC');
    expect(DateUtils.dateStringUTC(date, false)).toBe('15 Jan 2020, 13:45:30 UTC');
  });

  it('formats in the local time zone when useLocalTime is true', () => {
    // Delegate to the runtime's local zone rather than forcing UTC. Compared against the
    // equivalent locale call with no timeZone so the assertion holds in any test-machine zone.
    const localReference = date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZoneName: 'short',
    });
    expect(DateUtils.dateStringUTC(date, true)).toBe(localReference);
  });
});

describe('dateInputString', () => {
  const date = new Date('2020-01-15T13:45:30Z');

  it('returns the UTC ISO string by default', () => {
    expect(DateUtils.dateInputString(date)).toBe(date.toISOString());
    expect(DateUtils.dateInputString(date, false)).toBe('2020-01-15T13:45:30.000Z');
  });

  it('returns the local wall-clock (no trailing Z) when local is true, round-tripping', () => {
    const local = DateUtils.dateInputString(date, true);
    expect(local.endsWith('Z')).toBe(false);
    // Re-parsing the zone-less string as local time yields the original instant.
    expect(new Date(local).getTime()).toBe(date.getTime());
  });
});

describe('parseDateInput', () => {
  it('returns null for invalid input', () => {
    expect(DateUtils.parseDateInput('not a date', false)).toBe(null);
  });

  it('interprets zone-less input as UTC by default', () => {
    const parsed = DateUtils.parseDateInput('2020-01-15T08:45:30', false);
    expect(parsed.getUTCFullYear()).toBe(2020);
    expect(parsed.getUTCMonth()).toBe(0);
    expect(parsed.getUTCDate()).toBe(15);
    expect(parsed.getUTCHours()).toBe(8);
    expect(parsed.getUTCMinutes()).toBe(45);
    expect(parsed.getUTCSeconds()).toBe(30);
  });

  it('interprets zone-less input as local time when local is true', () => {
    const parsed = DateUtils.parseDateInput('2020-01-15T08:45:30', true);
    expect(parsed.getFullYear()).toBe(2020);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(15);
    expect(parsed.getHours()).toBe(8);
    expect(parsed.getMinutes()).toBe(45);
    expect(parsed.getSeconds()).toBe(30);
  });

  it('honors an explicit Z/UTC suffix regardless of mode', () => {
    expect(DateUtils.parseDateInput('2020-01-15T13:45:30Z', false).toISOString()).toBe(
      '2020-01-15T13:45:30.000Z'
    );
    expect(DateUtils.parseDateInput('2020-01-15T13:45:30Z', true).toISOString()).toBe(
      '2020-01-15T13:45:30.000Z'
    );
  });
});
