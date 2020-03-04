/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Chip  from 'components/Chip/Chip.react';

export const component = Chip;

export const demos = [
  {
    render: () => (
      <div>
        <Chip value='fieldName' />
        <Chip value='Role: Admin' />
        <Chip value='User: y2kjInQFr6' />
      </div>
    )
  }
];
