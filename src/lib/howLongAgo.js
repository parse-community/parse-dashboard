/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import pluralize from 'lib/pluralize';

// Approximations of time units
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * howLongAgo(Date) returns a human-friendly string saying how long ago a
 * date occurred.
 */
// TODO: i18n
export default function howLongAgo(date) {
  if (isNaN(date)) {
    return 'unknown time ago';
  }
  let delta = new Date() - date;
  if (delta < 0) {
    return 'in the future';
  }
  if (delta < HOUR) {
    return 'just now';
  }
  if (delta < DAY) {
    return pluralize(Math.floor(delta / HOUR), 'hour ago', 'hours ago');
  }
  if (delta < MONTH) {
    return pluralize(Math.floor(delta / DAY), 'day ago', 'days ago');
  }
  if (delta < YEAR) {
    return pluralize(Math.floor(delta / MONTH), 'month ago', 'months ago');
  }
  if (delta < YEAR * 1.25) {
    return '1 year ago';
  }
  if (delta < YEAR * 1.75) {
    return 'over 1 year ago';
  }
  if (delta < YEAR * 2) {
    return 'almost 2 years ago';
  }
  return String(Math.floor(delta / YEAR)) + ' years ago';
}
