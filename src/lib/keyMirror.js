/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/**
 * Takes an array of keys, and turns it into an object mapping keys to
 * themselves
 */
export default function keyMirror(keys) {
  let map = {};
  for (let i = 0; i < keys.length; i++) {
    map[keys[i]] = keys[i];
  }
  return map;
}
