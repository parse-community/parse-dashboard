/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { escape } from 'lib/StringEscaping';

export default function htmlString(pieces, ...vars) {
  let result = pieces[0];
  for (let i = 0; i < vars.length; i++) {
    result += escape(vars[i]) + pieces[i + 1];
  }
  return result;
}
