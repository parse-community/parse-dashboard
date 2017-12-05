/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ChromeDatePicker from 'components/ChromeDatePicker/ChromeDatePicker.react';
import { Directions }   from 'lib/Constants';
import React            from 'react';

export const component = ChromeDatePicker;

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: new Date() };
  }

  handleChange(value) {
    this.setState({ value });
  }

  render() {
    return (
      <ChromeDatePicker value={this.state.value} onChange={this.handleChange.bind(this)} align={this.props.align} />
    );
  }
}

export const demos = [
  {
    name: 'Left-aligned',
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Demo />
      </div>
    )
  },
  {
    name: 'Right-aligned',
    render: () => (
      <div style={{ width: 500, margin: '0 auto', textAlign: 'right' }}>
        <Demo align={Directions.RIGHT} />
      </div>
    )
  }
];
