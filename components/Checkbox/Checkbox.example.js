/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import Checkbox from 'components/Checkbox/Checkbox.react';

export const component = Checkbox;

export const demos = [
  {
    render: () => (
      <div>
        <div>
          <Checkbox label='unchecked' />
        </div>
        <div>
          <Checkbox checked={true} label='checked' />
        </div>
        <div>
          <Checkbox indeterminate={true} label='indeterminate' />
        </div>
      </div>
    )
  }
];
