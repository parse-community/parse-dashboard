/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Field from 'components/Field/Field.react';
import B4ALabelTemplate from 'components/B4ALabelTemplate/B4ALabelTemplate.react';

export const component = B4ALabelTemplate;

export const demos = [
  {
    render: () => (
      <Field
        height="150px"
        label={<B4ALabelTemplate
          imageSource="https://www.back4app.com/assets/images/illustrations/back4app-platform-desktop.jpg"
          title='Radio'
          subtitle='iOS Social Listings Shopping Application'
          author='xscoder in Full Applications'
          technologies={["IOS"]}
        />}
        input={null} />
    )
  }
];
