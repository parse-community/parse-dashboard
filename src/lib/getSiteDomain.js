/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export default function getSiteDomain() {
  let host = location.host.split('.');
  return location.protocol + '//' + host.slice(host.length - 2).join('.');
}
