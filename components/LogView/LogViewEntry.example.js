/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import LogViewEntry from 'components/LogView/LogViewEntry.react';

export const component = LogViewEntry;

export const demos = [
  {
    render: () => (
      <LogViewEntry text='I2015-09-30T00:25:26.950Z]Deployed v1 with triggers:'/>
    )
  }
];
