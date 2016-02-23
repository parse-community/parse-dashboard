/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
let numeric = /^[-+]?\d*\.?\d*$/;

export default function validateNumeric(str) {
  return numeric.test(str);
}
