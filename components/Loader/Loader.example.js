/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { center } from 'stylesheets/base.scss';
import Loader from 'components/Loader/Loader.react';
import React  from 'react';

export const component = Loader;

export const demos = [
  {
    render() {
      return (
        <div style={{
          width: 500,
          height: 500,
          margin: '10px auto',
          position: 'relative'
        }}>
          <Loader className={center} />
        </div>
      );
    }
  }
];
