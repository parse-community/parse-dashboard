/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import howLongAgo from 'lib/howLongAgo';

let ReleaseInfo = ({ release }) => {
  if (!release) {
    return '';
  }

  return [
    'Latest deploy: ',
    release.version,
    ' \u2022 ',
    howLongAgo(release.deployedAt),
    ' \u2022 SDK Version: ',
    release.parseVersion
  ].join('');
};

export default ReleaseInfo;
