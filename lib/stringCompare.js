/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export default function stringCompare(a, b) {
  return (a < b ? -1 : (a > b ? 1 : 0));
}
