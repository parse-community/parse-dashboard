/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Pill  from 'components/Pill/Pill.react';

export const component = Pill;

export const demos = [
  {
    render: () => (
      <div>
        <Pill value='Public Read + Write' />
        <Pill value='Public Read' />
        <Pill value='User: y2kjInQFr6' />
      </div>
    )
  }
];
