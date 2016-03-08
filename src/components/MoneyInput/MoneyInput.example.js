/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React     from 'react';
import Field     from 'components/Field/Field.react';
import Fieldset  from 'components/Fieldset/Fieldset.react';
import Label     from 'components/Label/Label.react';
import MoneyInput from 'components/MoneyInput/MoneyInput.react';

class Wrapper extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export const component = MoneyInput;

export const demos = [
  {
    render: () => (
      <Wrapper>
        <Fieldset>
          <Field
            label={<Label text='Money input' />}
            input={<MoneyInput value={100.2} onChange={() => {}} />} />
          <Field
            label={<Label text='Disabled' />}
            input={<MoneyInput value={9.99} enabled={false} onChange={() => {}} />} />
        </Fieldset>
      </Wrapper>
    )
  }
];
