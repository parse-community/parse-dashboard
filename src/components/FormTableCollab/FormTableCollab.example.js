/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field           from 'components/Field/Field.react';
import FormTableCollab from 'components/FormTableCollab/FormTableCollab.react';
import Label           from 'components/Label/Label.react';
import React           from 'react';

export const component = FormTableCollab;

export const demos = [
  {
    render: () => (
      <Field
        labelWidth={62}
        label={<Label text='Label' />}
        input={<FormTableCollab
          items={[
            {
              title: 'Title'
            },
            {
              title: 'Title',
              color: 'green',
              onDelete: () => {alert("Delete button clicked.")},
              onEdit: () => {alert("Edit button clicked.")}
            },
            {
              title: 'Title',
              color: 'red',
              onDelete: () => {alert("Delete button clicked.")},
              onEdit: () => {alert("Edit button clicked.")}
            },
            {
              title: 'Title',
              color: 'red',
              onDelete: () => {alert("Delete button clicked.")},
              onEdit: () => {alert("Edit button clicked.")}
            }
          ]} />
        }
      />
    )
  },
  {
    render: () => (
      <Field
        label={<Label text='Label' />}
        firstInput={<FormTableCollab
          keyWidth='150px'
          items={[
            {
              title: 'Title'
            },
          ]} />
        } />
    )
  },
];
