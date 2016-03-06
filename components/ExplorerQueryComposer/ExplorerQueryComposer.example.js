/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ExplorerQueryComposer from 'components/ExplorerQueryComposer/ExplorerQueryComposer.react';
import React                 from 'react';

export const component = ExplorerQueryComposer;

export const demos = [
  {
    name: 'New query',
    render: () => (
      <div style={{ width: '700px', position: 'relative' }}>
        <ExplorerQueryComposer
          isNew={true} />
      </div>
    )
  },
  {
    name: 'Old query, but no name',
    render: () => (
      <div style={{ width: '700px', position: 'relative' }}>
        <ExplorerQueryComposer
          isNew={false} />
      </div>
    )
  },
  {
    name: 'Query composer that shows grouping and aggregate',
    render: () => (
      <div style={{ width: '700px', position: 'relative' }}>
        <ExplorerQueryComposer
          isNew={false}
          isTimeSeries={true} />
      </div>
    )
  }
]
