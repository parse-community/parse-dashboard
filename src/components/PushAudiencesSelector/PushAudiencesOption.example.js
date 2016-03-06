/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import PushAudiencesOption from 'components/PushAudiencesSelector/PushAudiencesOption.react';

export const component = PushAudiencesOption;

let mockData = {
  id: '1',
  name: 'Everyone',
  createdAt: new Date(1444757195683)
};

export const demos = [
  {
  render() {
    return (
      <PushAudiencesOption
        id={mockData.id}
        inputId={mockData.inputId}
        name={mockData.name}
        createdAt={mockData.createdAt}
        inputName='test'
      />
    );
  }
}
];
