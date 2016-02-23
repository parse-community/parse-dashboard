/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import Toggle   from 'components/Toggle/Toggle.react';

class ToggleWrapper extends React.Component {
  constructor() {
    super();
    this.state = { value: false };
  }

  render() {
    return <Toggle {...this.props} value={this.state.value} onChange={(value) => this.setState({ value })} />;
  }
}

export const component = Toggle;

export const demos = [
  {
    name: 'Yes/No Toggle',
    render: () => (
      <ToggleWrapper />
    )
  }, {
    name: 'True/False Toggle',
    render: () => (
      <ToggleWrapper type={Toggle.Types.TRUE_FALSE} />
    ),
  }, {
    name: 'On/Off Toggle',
    render: () => (
      <ToggleWrapper type={Toggle.Types.ON_OFF} />
    ),
  }, {
    name: 'Two-Way Toggle',
    render: () => (
      <ToggleWrapper type={Toggle.Types.TWO_WAY} optionLeft='Hourly' optionRight='Daily' />
    ),
  }, {
    name: 'Custom Toggle',
    render: () => (
      <ToggleWrapper type={Toggle.Types.CUSTOM} optionLeft='Hourly' optionRight='Daily' labelLeft='Group by Hour' labelRight='Group by Day' />
    ),
  }
];
