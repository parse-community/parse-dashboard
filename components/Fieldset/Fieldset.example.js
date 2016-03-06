/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
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
        description='I am description.'>
        <Field
          label={<Label text='Label Text' description='Label Description' />}
          input={<Toggle value={true} type={Toggle.Types.YES_NO} onChange={function() {}} />} />
      </Fieldset>
    )
  }
];
