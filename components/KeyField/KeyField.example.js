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
