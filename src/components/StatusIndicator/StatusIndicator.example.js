/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React           from 'react';
import StatusIndicator from 'components/StatusIndicator/StatusIndicator.react';

export const component = StatusIndicator;

export const demos = [
  {
    name: 'Positive',
    render: () => (
      <StatusIndicator
        color={'green'}
        text={'Succeeded'} />
    )
  },
  {
    name: 'Negative',
    render: () => (
      <StatusIndicator
        color={'red'}
        text={'Failed'} />
    )
  },
  {
    name: 'In Progress',
    render: () => (
      <StatusIndicator
        color={'blue'}
        text={'Running'} />
    )
  }
];
