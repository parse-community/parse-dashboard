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
