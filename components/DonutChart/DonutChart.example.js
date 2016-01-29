import DonutChart from 'components/DonutChart/DonutChart.react';
import React      from 'react';

export const component = DonutChart;

export const demos = [
  {
    name: 'Simple DonutChart',
    render: () => (
      <DonutChart segments={[20, 100, 30]} />
    )
  }, {
    name: 'DonutChart without Dominant Value',
    render: () => (
      <DonutChart
        segments={[0.20, 0.25, 0.30, 0.40]}
        label='Installations' />
    )
  }, {
        name: 'Progress Bar with DonutChart',
    render: () => (
      <DonutChart
        segments={[20, 100]}
        isMonochrome={true}
        printPercentage={true}
        label='20/120GB' />
    )
  }
];
