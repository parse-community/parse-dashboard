/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ExplorerQueryPicker from 'components/ExplorerQueryPicker/ExplorerQueryPicker.react';
import React               from 'react';

export const component = ExplorerQueryPicker;

export const demos = [
  {
    render: () => {
      let queries = [
        {
          name: 'Audience',
          children: [
            {
              name: 'Daily Active Installations',
              query: { },
              preset: true
            },
            {
              name: 'Daily Active Users',
              query: { },
              preset: true
            },
            {
              name: 'Monthly Active Installations',
              query: { },
              preset: true
            },
            {
              name: 'Monthly Active Users',
              query: { },
              preset: true
            }
          ]
        }, {
          name: 'Core',
          children: [
            {
              name: 'Gogo Count',
              query: { },
              preset: true
            },
            {
              name: 'User Count',
              query: { },
              preset: true
            },
            {
              name: 'Installation Count',
              query: { },
              preset: true
            }
          ]
        }, {
          name: 'Events',
          children: [
            {
              name: 'API Requests',
              query: { },
              preset: true
            },
            {
              name: 'Analytics Requests',
              query: { },
              preset: true
            },
            {
              name: 'File Requests',
              query: { },
              preset: true
            },
            {
              name: 'Push Notifications',
              query: { },
              preset: true
            },
            {
              name: 'App Opens',
              query: { },
              preset: true
            },
            {
              name: 'Push Opens',
              query: { },
              preset: true
            }
          ]
        }, {
          name: 'Recent Queries',
          children: [
            {
              name: 'User Count Aggregate',
              query: { }
            }
          ]
        }, {
          name: 'Saved Queries',
          children: [
            {
              name: 'Gogo Queries',
              query: { }
            },
            {
              name: 'Saved Queries',
              query: { }
            }
          ]
        }
      ];

      return <ExplorerQueryPicker queries={queries} onCompose={() => {/* Do nothing */}} />
    }
  }
];
