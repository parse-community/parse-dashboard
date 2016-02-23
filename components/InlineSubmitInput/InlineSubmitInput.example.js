/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Label from 'components/Label/Label.react';
import InlineSubmitInput from 'components/InlineSubmitInput/InlineSubmitInput.react';

export const component = InlineSubmitInput;

export const demos = [
  {
    render: () => (
      <Fieldset>
        <Field
          label={<Label text='Basic example' description='Description 1' />}
          input={<InlineSubmitInput
            onSubmit={(v) => alert('submitting: ' + v)}
            submitButtonText='ADD' />} />
        <Field
          label={<Label text='Custom validation' description='Description 2' />}
          input={<InlineSubmitInput
            validate={(v) => v.length > 5}
            placeholder='Must be longer than 5 letters'
            onSubmit={(v) => alert('submitting: ' + v)}
            submitButtonText='ADD' />} />
      </Fieldset>
    )
  }
];
