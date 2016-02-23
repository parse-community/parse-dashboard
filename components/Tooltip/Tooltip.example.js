/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateRange from 'components/DateRange/DateRange.react';
import React     from 'react';
import Tooltip   from 'components/Tooltip/Tooltip.react';

export const component = Tooltip;

export const demos = [
  {
    name: 'Simple Tooltip',
    render: () => (
      <Tooltip
        value={(
          <div>
            Some tooltip here. It might contain awesome <pre>formatting</pre> and not just simple text
          </div>
      )}>
        <div>Demo content</div>
      </Tooltip>
    )
  },
  {
    name: 'Tooltip doesn\'t break layout',
    render: () => (
      <div>
        <Tooltip
          value={(
            <div>
              Some tooltip here. It might contain awesome <pre>formatting</pre> and not just simple text
            </div>
        )}>
          <span>Demo content 1</span>
        </Tooltip>
        <Tooltip
          value={(
            <div>
              Some tooltip here. It might contain awesome <pre>formatting</pre> and not just simple text
            </div>
        )}>
          <span>Demo content 2</span>
        </Tooltip>
        <Tooltip
          value={(
            <div>
              Some tooltip here. It might contain awesome <pre>formatting</pre> and not just simple text
            </div>
        )}>
          <DateRange />
        </Tooltip>
      </div>
    )
  }
];
