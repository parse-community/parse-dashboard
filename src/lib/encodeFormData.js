/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export default function encodeFormData(key, value, prevKey) {
  let field = key;
  if (prevKey) {
    field = prevKey + '[' + key + ']';
  }
  if (typeof value === 'string') {
    return encodeURI(field) + '=' + encodeURIComponent(value);
  }
  if (typeof value !== 'object') {
    return encodeURI(field) + '=' + String(value);
  }
  if (value && typeof value.toJSON === 'function') {
    return encodeURI(field) + '=' + encodeURI(value.toJSON());
  }
  let pieces = [];
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      pieces.push(encodeFormData('', value[i], field));
    }
    return pieces.join('&');
  }
  for (let k in value) {
    pieces.push(encodeFormData(k, value[k], field));
  }
  return pieces.join('&');
}
