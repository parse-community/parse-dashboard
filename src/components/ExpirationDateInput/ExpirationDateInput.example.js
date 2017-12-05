/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field               from 'components/Field/Field.react';
import ExpirationDateInput from 'components/ExpirationDateInput/ExpirationDateInput.react';
import Label               from 'components/Label/Label.react';
import React               from 'react';

export const component = ExpirationDateInput;

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { month: 1, year: 2016 };
  }

  render() {
    return (
      <ExpirationDateInput
        month={this.state.month}
        year={this.state.year}
        onChange={(change) => this.setState(change)} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='When does it expire?' />}
          input={<Demo />} />
      </div>
    )
  }
];
