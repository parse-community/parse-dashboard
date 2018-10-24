/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import Field    from 'components/Field/Field.react';
import B4AAlert from 'components/B4AAlert/B4AAlert.react';

export const component = B4AAlert;

export const demos = [
  {
    render: () => (
      <Field
        label={<B4AAlert title='This is my text.' description='This is my description.' />}
        input={null} />
    )
  }, {
    render: () => (
      <Field
        label={<B4AAlert show={false} title='This is my text.' description='This is my description.' />}
        input={null} />
    )
  }, {
    render: () => (
      <Field
        label={<B4AAlert show={true} title='This is my text.' description='This is my description.' />}
        input={null} />
    )
  },
];
