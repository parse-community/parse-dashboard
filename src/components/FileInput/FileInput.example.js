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
import FileInput from 'components/FileInput/FileInput.react';

export const component = FileInput;

export const demos = [
  {
    render: () => (
      <Fieldset>
        <Field
          label={<Label text='No prefill' />}
          input={<FileInput onChange={function(){}} />} />
        <Field
          label={<Label text='String value' />}
          input={<FileInput value='my_file.txt' onChange={function(){}} />} />
        <Field
          label={<Label text='Object value' description='But this object has no URL' />}
          input={<FileInput value={{ name: 'my_file.txt' }} onChange={function(){}} />} />
        <Field
          label={<Label text='Object value' description='This object has a name and a value' />}
          input={<FileInput value={{ name: 'my_file.txt', url: 'https://www.parse.com' }} onChange={function(){}} />} />
      </Fieldset>
    )
  }
];
