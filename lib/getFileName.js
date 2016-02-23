/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

export default function getFileName(name) {
  if (name instanceof Parse.File) {
    return getFileName(name.name());
  }
  let offset = 37;
  if (name.indexOf('tfss-') === 0) {
    offset += 5;
  }
  return name.substr(offset);
}
