/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ChartColorSchemes } from 'lib/Constants';
import Chart from 'components/Chart/Chart.react';
import React from 'react';

export const component = Chart;

export const demos = [
  {
    render: () => (
      <Chart
        width={800}
        height={400}
        data={{
          'Group A': {
            color: ChartColorSchemes[0],
            points: [[1439424000000,51],[1439510400000,66],[1439596800000,36],[1439683200000,64],[1439769600000,46],[1439856000000,42],[1439942400000,45],[1440028800000,70],[1440115200000,7]]
          },
          'Group B': {
            color: ChartColorSchemes[1],
            points: [[1439424000000,40],[1439510400000,24],[1439596800000,12],[1439683200000,80],[1439769600000,98],[1439856000000,88],[1439942400000,84],[1440028800000,88],[1440115200000,18]]
          },
        }} />
    )
  }, {
    render: () => (
      <Chart
        width={800}
        height={400}
        data={{
          'Hourly data': {
            color: ChartColorSchemes[2],
            points: [[1439449200000,3],[1439452800000,2],[1439456400000,2],[1439460000000,4],[1439463600000,1],[1439467200000,4],[1439470800000,4],[1439474400000,1],[1439478000000,2],[1439481600000,2]]
          }
        }}
        formatter={(value) => value + ' arbitrary units'} />
    )
  }
];
