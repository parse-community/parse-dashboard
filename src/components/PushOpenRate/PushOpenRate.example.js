/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import PushOpenRate from 'components/PushOpenRate/PushOpenRate.react';

export const component = PushOpenRate;

export const demos = [
  {
    name: 'Normal Push <10%',
    render: () => (
      <PushOpenRate numOpened={24} numSent={2112} color='blue' />
    )
  },
  {
    name: 'Normal Push >10%',
    render: () => (
      <PushOpenRate numOpened={325} numSent={2112} color='blue' />
    )
  },
  {
    name: 'Normal Push Integer Percent',
    render: () => (
      <PushOpenRate numOpened={100} numSent={1000} color='blue' />
    )
  },
  {
    name: 'Push Experiment A Wins',
    render: () => (
      <div>
        <div style={{ width: '50%', float: 'left' }}>
          <PushOpenRate numOpened={102}
                        numSent={4342}
                        color='yellow'
                        isExperiment={true}
                        isWinner={true}/>
        </div>
        <div style={{ marginLeft: '50%' }}>
          <PushOpenRate numOpened={5}
                        numSent={3223}
                        color='pink'
                        isExperiment={true}
                        isWinner={false}/>
        </div>
      </div>
    )
  },
  {
    name: 'Push Experiment B Wins',
    render: () => (
      <div>
        <div style={{ width: '50%', float: 'left' }}>
          <PushOpenRate numOpened={232}
                        numSent={12413}
                        color='yellow'
                        isExperiment={true}
                        isWinner={false}/>
        </div>
        <div style={{ marginLeft: '50%' }}>
          <PushOpenRate numOpened={455}
                        numSent={13419}
                        color='pink'
                        isExperiment={true}
                        isWinner={true}/>
        </div>
      </div>
    )
  },
];
