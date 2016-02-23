/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const rangeSize = {
  az: 26,
  AZ: 26,
  num: 10,
  sym: 33
};

// Returns 0 if the password does not meet length requirements
// Returns 1 if the password meets length requirements, but the entropy is low
// Returns 2 if the password has good total entropy
export default function passwordStrength(password) {
  if (password.length < 8) {
    return 0;
  }
  // We approximate entropy by determining which character sets are included in
  // the password string.
  let seen = {
    az: false,
    AZ: false,
    num: false,
    sym: false
  };
  for (let i = password.length; i--;) {
    let c = password.charCodeAt(i);
    if (c > 47 && c < 58) {
      seen.num = true;
    } else if (c > 64 && c < 91) {
      seen.AZ = true;
    } else if (c > 96 && c < 123) {
      seen.az = true;
    }
  }
  let range = 0;
  for (let r in seen) {
    if (seen[r]) {
      range += rangeSize[r];
    }
  }
  let entropy = Math.log(range) / Math.log(2) * password.length;
  return (entropy > 60 ? 2 : 1);
}
