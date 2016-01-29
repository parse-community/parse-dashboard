import React    from 'react';
import Field    from 'components/Field/Field.react';
import Label    from 'components/Label/Label.react';
import Toggle   from 'components/Toggle/Toggle.react';
import TextInput from 'components/TextInput/TextInput.react';

export const component = Field;

export const demos = [
  {
    render: () => (
      <Field
        label={<Label text='Are you a monster hunter?' description='Or have you become the monster' />}
        input={<Toggle value={true} type={Toggle.Types.YES_NO} onChange={() => {}} />} />
    )
  },
  {
    render: () => (
      <Field
        height={500}
        labelWidth={40}
        label={<Label text='This field is taller' description='And has a really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really long description.' />}
        input={<TextInput value="" height={'100%'} multiline={true} onChange={() => {}} />} />
    )
  }
];
