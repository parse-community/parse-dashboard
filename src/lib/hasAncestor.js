/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export default function hasAncestor(node, ancestor) {
  let cur = node.parentNode;
  while (cur && cur.nodeType === 1) {
    if (cur === ancestor) {
      return true;
    }
    cur = cur.parentNode;
  }
  return false;
}
