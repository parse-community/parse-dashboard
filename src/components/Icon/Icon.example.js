/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon  from 'components/Icon/Icon.react';
import React from 'react';

export const component = Icon;

export const demos = [
  {
    render: () => (
      <div>
        <Icon name='infinity' fill='#000000' width={50} height={50} />
        <Icon name='infinity' fill='#169cee' width={200} height={200} />
        <Icon name='infinity' fill='#ff395e' width={100} height={100} />
        <Icon name='infinity' fill='#00db7c' width={20} height={20} />
      </div>
    )
  }
];
