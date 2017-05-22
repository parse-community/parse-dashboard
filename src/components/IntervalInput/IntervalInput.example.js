/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field           from 'components/Field/Field.react';
import IntervalInput   from 'components/IntervalInput/IntervalInput.react';
import Label           from 'components/Label/Label.react';
import React           from 'react';

export const component = IntervalInput;

class IntervalDemo extends React.Component {
  constructor() {
    super();
    this.state = { count: 15, unit: 'minute' };
  }

  handleChange(count, unit) {
    this.setState({ count, unit });
  }

  render() {
    return (
      <IntervalInput
        count={this.state.count}
        unit={this.state.unit}
        onChange={this.handleChange.bind(this)} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='How often should it repeat?' />}
          input={<IntervalDemo />} />
      </div>
    )
  }
];
