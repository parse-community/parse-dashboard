/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Field from 'components/Field/Field.react';
import B4ADescriptionTemplate from 'components/B4ADescriptionTemplate/B4ADescriptionTemplate.react';

export const component = B4ADescriptionTemplate;

export const demos = [
  {
    render: () => (
      <Field
        height="200px"
        label={null}
        input={<B4ADescriptionTemplate
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          link='https://www.back4app.com/assets/images/illustrations/back4app-platform-desktop.jpg'
        />} />
    )
  }
];
