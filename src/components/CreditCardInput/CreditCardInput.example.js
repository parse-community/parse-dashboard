/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CreditCardInput from 'components/CreditCardInput/CreditCardInput.react';
import React           from 'react';
import Field           from 'components/Field/Field.react';
import Label           from 'components/Label/Label.react';

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: null };
  }

  render() {
    return (
      <CreditCardInput
        value={this.state.value}
        lastFour={this.props.lastFour}
        onChange={(value) => this.setState({ value })} />
    );
  }
}

export const component = CreditCardInput;

export const demos = [
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Field label={<Label text='Empty demo' />} input={<Demo />} />
      </div>
    )
  },
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Field label={<Label text='Prefilled with last four' />} input={<Demo lastFour='1234' />} />
      </div>
    )
  }
];
