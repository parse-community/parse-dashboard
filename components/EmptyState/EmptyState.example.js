/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import EmptyState from 'components/EmptyState/EmptyState.react';

export const component = EmptyState;

export const demos = [
  {
    name: 'Example with Action callback',
    render: () => (
      <div style={{height: '800px', position: 'relative'}}>
        <EmptyState
          icon={'icon_cloudCode'}
          title={'You don\u2019t have any data here'}
          description={'Once you create some data, you will be able to see it here'}
          cta={'CTA for this data'}
          action={() => alert('CTA was clicked')}></EmptyState>
      </div>
    )
  },
  {
    name: 'Example with Action href',
    render: () => (
      <div style={{height: '800px', position: 'relative'}}>
        <EmptyState
          icon={'icon_cloudCode'}
          title={'You don\u2019t have any data here'}
          description={'Once you create some data, you will be able to see it here'}
          cta={'CTA for this data'}
          action={'someLink'}></EmptyState>
      </div>
    )
  }
]
