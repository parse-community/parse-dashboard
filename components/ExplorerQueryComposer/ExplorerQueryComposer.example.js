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
