import Field        from 'components/Field/Field.react';
import FormTable    from 'components/FormTable/FormTable.react';
import Label        from 'components/Label/Label.react';
import React        from 'react';
import { daysFrom } from 'lib/DateUtils';

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
