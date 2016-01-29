import React      from 'react';
import LoaderDots from 'components/LoaderDots/LoaderDots.react';

export const component = LoaderDots;

export const demos = [
  {
    name: 'Loader Dots',
    render: () => (
      <div>
        <LoaderDots />
      </div>
    )
  }
];
