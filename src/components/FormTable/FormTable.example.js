/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field        from 'components/Field/Field.react';
import FormTable    from 'components/FormTable/FormTable.react';
import Label        from 'components/Label/Label.react';
import React        from 'react';

export const component = FormTable;

export const demos = [
  {
    render: () => (
      <Field
        label={<Label text='Label' />}
        input={<FormTable
          items={[
            {
              title: 'Title',
              notes: [
                {
                  key: 'key',
                  value: 'value',
                  strong: false,
                },
                {
                  key: 'important',
                  value: 'pay attention',
                  strong: true,
                }
              ],
            },
            {
              title: 'Title',
              color: 'red',
              onDelete: () => {alert("Delete button clicked.")},
              notes: [
                {
                  key: 'foo',
                  keyColor: 'red',
                  value: 'bar',
                }
              ]
            }
          ]} />
        } />
    )
  },
  {
    render: () => (
      <Field
        label={<Label text='Label' />}
        input={<FormTable
          keyWidth='150px'
          items={[
            {
              title: 'Title',
              notes: [
                {
                  key: 'very wide key here',
                  value: 'so I passed keyWidth. Also very very very very very very very very very very very very very very  long value.',
                }
              ],
            },
          ]} />
        } />
    )
  },
];
