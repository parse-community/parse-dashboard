/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import B4AFieldTemplate    from 'components/B4AFieldTemplate/B4AFieldTemplate.react';

export const component = B4AFieldTemplate;

export const demos = [
  {
    render: () => (
      <B4AFieldTemplate
        imageSource="https://www.back4app.com/assets/images/illustrations/back4app-platform-desktop.jpg"
        title='Radio'
        subtitle='iOS Social Listings Shopping Application'
        author='xscoder in Full Applications'
        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s."
        link='https://www.back4app.com'
        technologies={["IOS", "Android"]}
      />
    )
  }
];
