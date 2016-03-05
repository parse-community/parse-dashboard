/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
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
