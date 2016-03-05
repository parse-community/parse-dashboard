/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Calendar from 'components/Calendar/Calendar.react';
import React    from 'react';

export const component = Calendar;

export const demos = [
  {
    render: () => (
      <div>
        <Calendar value={new Date()} onChange={function() {}} />
      </div>
    )
  }
];
