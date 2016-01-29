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
