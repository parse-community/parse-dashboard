/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import PushAudiencesSelector from 'components/PushAudiencesSelector/PushAudiencesSelector.react';

export const component = PushAudiencesSelector;

class PushAudiencesSelectorDemo extends React.Component {
  constructor() {
    super();
    this.state = { current: '1'};
  }

  handleChange(value) {
    this.setState({ current: value});
  }

  render() {
    return (
      <PushAudiencesSelector audiences={this.props.audiences} current={this.state.current} onChange={this.handleChange.bind(this)}/>
    );
  }
}

let mockData = [
  {
    objectId: '1',
    name: 'Everyone',
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '2',
    name: 'iOS Users in US',
    createdAt: new Date(1444757195683)
  },
    {
    objectId: '3',
    name: 'Completed Checkout <30 days',
    createdAt: new Date(1444757195683)
  },
    {
    objectId: '4',
    name: 'New Users',
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '5',
    name: 'Everyone',
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '6',
    name: 'iOS Users in US',
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '7',
    name: 'Completed Checkout <30 days',
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '8',
    name: 'New Users',
    createdAt: new Date(1444757195683)
  },
];

export const demos = [
  {
    render() {
      return (
        <PushAudiencesSelectorDemo audiences={mockData}/>
      );
    }
  }
];
