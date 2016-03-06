/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React      from 'react';
import LoaderDots from 'components/LoaderDots/LoaderDots.react';

export const component = LoaderDots;

export const demos = [
  {
    name: 'Loader Dots',
    render: () => (
      <div>
        <LoaderDots />
      </div>
    )
  }
];
