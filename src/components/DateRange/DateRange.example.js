/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateRange      from 'components/DateRange/DateRange.react';
import { Directions } from 'lib/Constants';
import React          from 'react';

export const component = DateRange;

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: {} };
  }

  handleChange(newValue) {
    this.setState({ value: newValue });
  }

  render() {
    return (
      <DateRange value={this.state.value} onChange={this.handleChange.bind(this)} align={this.props.align} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Demo />
      </div>
    )
  },
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto', textAlign: 'right' }}>
        <Demo align={Directions.RIGHT} />
      </div>
    )
  }
];
