/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { unescape } from 'lib/StringEscaping';

let currentToken = null;

export function getToken() {
  if (!currentToken) {
    let tokenScript = document.getElementById('csrf');
    if (tokenScript) {
      currentToken = JSON.parse(unescape(tokenScript.innerHTML));
    }
  }
  return currentToken;
}
