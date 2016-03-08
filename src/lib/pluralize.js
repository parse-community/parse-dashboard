/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export default function pluralize(count, word, plural) {
  if (count === 1) {
    return String(count) + ' ' + word;
  }
  return String(count) + ' ' + (plural || word + 's');
}
