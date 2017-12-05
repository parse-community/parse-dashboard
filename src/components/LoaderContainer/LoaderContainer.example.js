/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import LoaderContainer       from 'components/LoaderContainer/LoaderContainer.react';
import PushAudiencesSelector from 'components/PushAudiencesSelector/PushAudiencesSelector.react';
import React                 from 'react';

export const component = LoaderContainer;

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
    count: 148,
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '2',
    name: 'iOS Users in US',
    count: 148,
    createdAt: new Date(1444757195683)
  },
    {
    objectId: '3',
    name: 'Completed Checkout <30 days',
    count: 148,
    createdAt: new Date(1444757195683)
  },
    {
    objectId: '4',
    name: 'New Users',
    count: 148,
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '5',
    name: 'Everyone',
    count: 148,
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '6',
    name: 'iOS Users in US',
    count: 148,
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '7',
    name: 'Completed Checkout <30 days',
    count: 148,
    createdAt: new Date(1444757195683)
  },
  {
    objectId: '8',
    name: 'New Users',
    count: 148,
    createdAt: new Date(1444757195683)
  },
];

class LoaderContainerDemo extends React.Component {
  constructor() {
    super();
    this.state = { loading: true};
  }

  render(){
    return (
      <div>
        <LoaderContainer loading={ this.state.loading }>
          <PushAudiencesSelectorDemo audiences={mockData}/>
        </LoaderContainer>
      </div>
    );
  }
}

export const demos = [
  {
    render() {
      return (
        <LoaderContainerDemo />
      );
    }
  }
];
