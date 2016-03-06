/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React                  from 'react';
import PushExperimentDropdown from 'components/PushExperimentDropdown/PushExperimentDropdown.react';

export const component = PushExperimentDropdown;

class PushExperimentDropdownDemo extends React.Component {
  constructor() {
    super();
    this.state = { color: 'blue' };
  }

  render() {
    return (
      <PushExperimentDropdown
        width={155}
        placeholder='Choose a group'
        value={this.state.color}
        color={this.state.color.toLowerCase()}
        onChange={(color) => this.setState({ color })}
        options={[{key: 'Group A (winner)', style: {color: 'green'} }, {key: 'Group B (loser)', style: {color: 'red'}}]} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div>
        <PushExperimentDropdownDemo />
      </div>
    )
  },
];
