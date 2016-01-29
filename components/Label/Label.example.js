import React from 'react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';

export const component = Label;

export const demos = [
  {
    render: () => (
      <Field
        label={<Label text='This is my text.' description='This is my description.' />}
        input={null} />
    )
  }
];
