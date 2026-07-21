/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

export default function decodeConfigValue(value) {
  if (value && typeof value === 'object') {
    if (value.__type === 'File') {
      return Parse.File.fromJSON(value);
    }
    if (value.__type === 'GeoPoint') {
      return new Parse.GeoPoint(value);
    }
    if (value.__type === 'Date') {
      return new Date(value.iso);
    }
  }
  return value;
}
