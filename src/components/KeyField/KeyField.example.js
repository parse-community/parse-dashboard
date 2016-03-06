/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import KeyField from 'components/KeyField/KeyField.react';
import Label from 'components/Label/Label.react';

export const component = KeyField;

export const demos = [
  {
    render: () => (
      <Fieldset legend='App Keys'>
        <Field
          label={<Label text='Public key' description='Not a secret.' />}
          input={<KeyField>abc123qwerty4567890</KeyField>} />
        <Field
          label={<Label text='Secret key' description='Very much a secret.' />}
          input={<KeyField hidden={true}>abc123qwerty4567890</KeyField>} />
      </Fieldset>
    )
  }
];
