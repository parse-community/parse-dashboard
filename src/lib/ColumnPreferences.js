/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const VERSION = 'v1'; // In case we ever need to invalidate these
const DEFAULT_WIDTH = 150;
const COLUMN_SORT = '_columnSort'; // Used for storing classes sort field
const COLUMN_DEFAULT_SORT = '-createdAt'; // Default column sorting
let cache = {};

export function updatePreferences(prefs, appId, className) {
  try {
    localStorage.setItem(path(appId, className), JSON.stringify(prefs));
  } catch (e) {
    // Fails in Safari private browsing
  }
  cache[appId] = cache[appId] || {};
  cache[appId][className] = prefs;
}

export function getPreferences(appId, className) {
  if (cache[appId] && cache[appId][className]) {
    return cache[appId][className];
  }
  let entry;
  try {
    entry = localStorage.getItem(path(appId, className));
  } catch (e) {
    // Fails in Safari private browsing
    entry = null;
  }
  if (!entry) {
    return null;
  }
  try {
    let prefs = JSON.parse(entry);
    cache[appId] = cache[appId] || {};
    cache[appId][className] = prefs;
    return prefs;
  } catch (e) {
    return null;
  }
}

export function getColumnSort(sortBy, appId, className) {
  let objectName = className + ':' + COLUMN_SORT;
  let cachedSort = getPreferences(appId, objectName) || [ { name: COLUMN_DEFAULT_SORT } ];
  let updated = false;
  if(cachedSort !== sortBy) {
    updated = true;
  }
  if (updated && sortBy) {
    cachedSort = sortBy;
    updatePreferences(sortBy, appId, objectName);
  }
  return cachedSort;
}

export function getOrder(cols, appId, className) {
  let prefs = getPreferences(appId, className) || [ { name: 'objectId', width: DEFAULT_WIDTH } ];
  let order = [].concat(prefs);
  let seen = {};
  for (let i = 0; i < order.length; i++) {
    seen[order[i].name] = true;
  }
  let requested = {};
  let updated = false;
  for (let name in cols) {
    requested[name] = true;
    if (!seen[name]) {
      order.push({ name: name, width: DEFAULT_WIDTH });
      seen[name] = true;
      updated = true;
    }
  }
  let filtered = [];
  for (let i = 0; i < order.length; i++) {
    let name = order[i].name;
    if (requested[name]) {
      filtered.push(order[i]);
    } else {
      updated = true;
    }
  }
  if (updated) {
    updatePreferences(filtered, appId, className);
  }
  return filtered;
}

function path(appId, className) {
  return `ParseDashboard:${VERSION}:${appId}:${className}`;
}
