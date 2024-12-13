/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
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
  'December',
];

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const toString = Object.prototype.toString;

export function isDate(obj) {
  return typeof obj === 'object' && toString.call(obj).indexOf('Date') > -1;
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
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function prevMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function daysInMonth(date) {
  const next = nextMonth(date);
  const lastDay = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1);
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

export function dateStringUTC(date) {
  let full =
    String(date.getUTCDate()) +
    ' ' +
    shortMonth(date.getUTCMonth()) +
    ' ' +
    String(date.getUTCFullYear()) +
    ' at ';
  const time = {
    hours: String(date.getUTCHours()),
    minutes: String(date.getUTCMinutes()),
    seconds: String(date.getUTCSeconds()),
  };
  for (const k in time) {
    if (time[k].length < 2) {
      time[k] = '0' + time[k];
    }
  }
  full += time.hours + ':' + time.minutes + ':' + time.seconds + ' UTC';
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
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function yearMonthDayTimeFormatter(date, useUTC) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: useUTC ? 'UTC' : undefined
  };
  return date.toLocaleString('en-US', options)
    .replace(',', '')  // Remove comma between date and time
    .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'); // Convert to yyyy-MM-dd format
}

export function getDateMethod(local, methodName) {
  if (!local) {
    return methodName.replace('get', 'getUTC');
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

export function formatDateTime(date, useLocalTime = false) {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Determine whether to use local time or UTC time based on useLocalTime flag
  const year = useLocalTime ? d.getFullYear() : d.getUTCFullYear();
  const month = (useLocalTime ? d.getMonth() : d.getUTCMonth()) + 1;
  const day = useLocalTime ? d.getDate() : d.getUTCDate();
  const hours = useLocalTime ? d.getHours() : d.getUTCHours();
  const minutes = useLocalTime ? d.getMinutes() : d.getUTCMinutes();
  const seconds = useLocalTime ? d.getSeconds() : d.getUTCSeconds();

  // Pad numbers with leading zeros
  const pad = (num) => String(num).padStart(2, '0');

  return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
