/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React      from 'react';
import Field      from 'components/Field/Field.react';
import Fieldset   from 'components/Fieldset/Fieldset.react';
import FormButton from 'components/FormButton/FormButton.react';
import Label      from 'components/Label/Label.react';

export const component = FormButton;

export const demos = [
  {
    render: () => (
      <Fieldset legend='Form Buttons'>
        <Field
          label={<Label text='Cool button' description='It does something.' />}
          input={<FormButton value='Do something cool' />} />
        <Field
          label={<Label text='Danger danger' description='Danger button.' />}
          input={<FormButton color='red' value='Do dangerous thing' />} />
      </Fieldset>
    )
  }
];
