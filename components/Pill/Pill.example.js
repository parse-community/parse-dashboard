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
