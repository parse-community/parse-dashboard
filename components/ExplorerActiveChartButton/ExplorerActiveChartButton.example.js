/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ExplorerActiveChartButton from 'components/ExplorerActiveChartButton/ExplorerActiveChartButton.react';
import React                     from 'react';
import { ChartColorSchemes }     from 'lib/Constants';

export const component = ExplorerActiveChartButton;

const QUERIES = [
  {
    name: 'Audience',
    children: [
      {
        name: 'Daily Active Installations',
        query: { },
        preset: true,
        nonComposable: true
      },
      {
        name: 'Daily Active Users',
        query: { },
        preset: true,
        nonComposable: true
      },
      {
        name: 'Monthly Active Installations',
        query: { },
        preset: true,
        nonComposable: true
      },
      {
        name: 'Monthly Active Users',
        query: { },
        preset: true,
        nonComposable: true
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

export const demos = [
  {
    name: 'Default',
    render: () => {
      return (
        <ExplorerActiveChartButton
          queries={QUERIES}
          query={{
            name: 'User Count Aggregate'
          }}
          color={ChartColorSchemes[0]}
          onSave={() => {/* Do nothing */}}
          onToggle={() => {/* Do nothing */} } />
      );
    }
  }, {
    name: 'With Custom Color',
    render: () => {
      return (
        <ExplorerActiveChartButton
          queries={QUERIES}
          query={{
            name: 'User Count Aggregate'
          }}
          color={ChartColorSchemes[1]}
          onSave={() => {/* Do nothing */}}
          onToggle={() => {/* Do nothing */} } />
      );
    }
  }, {
    name: 'Without Dropdown',
    render: () => {
      return (
        <ExplorerActiveChartButton
          queries={QUERIES}
          query={{
            name: 'User Count Aggregate'
          }}
          color={ChartColorSchemes[1]}
          onSave={() => {/* Do nothing */}}
          onToggle={() => {/* Do nothing */} }
          disableDropdown={true} />
      );
    }
  }, {
    name: 'With Non-Composable Query',
    render: () => {
      return (
        <ExplorerActiveChartButton
          queries={QUERIES}
          query={{
            name: 'User Count Aggregate',
            nonComposable: true
          }}
          color={ChartColorSchemes[1]}
          onSave={() => {/* Do nothing */}}
          onToggle={() => {/* Do nothing */} } />
      );
    }
  }
]
