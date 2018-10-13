/*
import { native } from '../../Parse-Dashboard/public/bundles/dashboard.bundle';
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { findTimeZone, getZonedTime } from 'timezone-support';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const toString = Object.prototype.toString;

export function isDate(obj) {
  return typeof(obj) === 'object' && toString.call(obj).indexOf('Date') > -1;
}

export function getWeekday(n) {
  return WEEKDAYS[n];
}

export function getMonth(n) {
  return MONTHS[n];
}

/**
 * Returns the short form of a month.
 * Normally, it returns the first 3 letters. Special cases are June, July, or Sept.
 */
export function shortMonth(month) {
  if (month === 5 || month === 6 || month === 8) {
    return MONTHS[month].substr(0, 4);
  }
  if (!MONTHS[month]) {
    return '';
  }
  return MONTHS[month].substr(0, 3);
}

export function nextMonth(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
}

export function prevMonth(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );
}

export function daysInMonth(date) {
  let next = nextMonth(date);
  let lastDay = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1);
  return lastDay.getDate();
}

export function hoursFrom(date, delta) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours() + delta,
    date.getMinutes()
  );
}

export function daysFrom(date, delta) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + delta,
    date.getHours(),
    date.getMinutes()
  );
}

export function monthsFrom(date, delta) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + delta,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
}

export function dateString(nativeDate, timezone = null) {
  let date = {
    year: nativeDate.getUTCFullYear(),
    month: nativeDate.getUTCMonth(),
    day: nativeDate.getUTCDate(),
    hours: nativeDate.getUTCHours(),
    minutes: nativeDate.getUTCMinutes(),
    seconds: nativeDate.getUTCSeconds(),
  };

  if (timezone) {
    date = getZonedTime(nativeDate, findTimeZone(timezone));
  }

  let full = String(date.day) + ' ' +
    shortMonth(date.month) + ' ' +
    String(date.year) + ' at ';

  ['hours', 'minutes', 'seconds'].forEach(key => {
    date[key] = String(date[key]);
    if (date[key].length < 2) {
      date[key] = '0' + date[key];
    }
  });

  full += date.hours + ':' + date.minutes + ':' + date.seconds + ' UTC';
  return full;
}

export function monthDayStringUTC(date) {
  return `${shortMonth(date.getUTCMonth())} ${date.getUTCDate()}`;
}

/**
 * Formats Date input into type {month} {dd}, {yyyy}
 * @param  {Date} date
 * @return {String}
 */
export function yearMonthDayFormatter(date) {
  return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
}

export function yearMonthDayTimeFormatter(date, timeZone) {
  let options = {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false};
  if (timeZone) {
    options.timeZoneName = 'short';
  }
  return date.toLocaleDateString('en-US', options);
}

export function getDateMethod(local, methodName) {
  if (!local) {
    return methodName.replace('get','getUTC');
  } else {
    return methodName;
  }
}

export function pad(number) {
  let r = String(number);
  if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}
