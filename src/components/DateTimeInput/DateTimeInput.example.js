/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimeInput from 'components/DateTimeInput/DateTimeInput.react';
import Field      from 'components/Field/Field.react';
import Label      from 'components/Label/Label.react';
import React      from 'react';

export const component = DateTimeInput;

class DateTimeInputDemo extends React.Component {
  constructor() {
    super();
    this.state = { value: null };
  }

  handleChange(newValue) {
    this.setState({ value: newValue });
  }

  render() {
    return (
      <DateTimeInput local={this.props.local} value={this.state.value} onChange={this.handleChange.bind(this)} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Field
          label={<Label text='When should we deliver the notification in UTC time?' />}
          input={<DateTimeInputDemo />} />
      </div>
    )
  },
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Field
          label={<Label text='When should we deliver the notification in local time?' />}
          input={<DateTimeInputDemo local={true} />} />
      </div>
    )
  }
];
