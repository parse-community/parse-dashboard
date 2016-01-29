import React    from 'react';
import Field    from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Label    from 'components/Label/Label.react';
import Toggle   from 'components/Toggle/Toggle.react';

export const component = Fieldset;

export const demos = [
  {
    render: () => (
      <Fieldset
        legend='I am Legend'
        description='In which Will Smith ruins a profoundly philosophical novel.'>
        <Field
          label={<Label text='Are you a monster hunter?' description='Or have you become the monster' />}
          input={<Toggle value={true} type={Toggle.Types.YES_NO} onChange={function() {}} />} />
      </Fieldset>
    )
  }
];
