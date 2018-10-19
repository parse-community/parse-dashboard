/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React       from 'react';
import CloudCodeView from 'components/CloudCodeView/CloudCodeView.react';

export const component = CloudCodeView;

export const demos = [
  {
    render() {
      return (
        <CloudCodeView source={this.props.source} language='javascript' />
      )
    }
  }
];
