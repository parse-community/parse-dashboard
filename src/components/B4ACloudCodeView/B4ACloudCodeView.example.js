/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React       from 'react';
import B4ACloudCodeView from 'components/B4ACloudCodeView/B4ACloudCodeView.react';

export const component = B4ACloudCodeView;

export const demos = [
  {
    render() {
      return (
        <B4ACloudCodeView source={this.props.source} extension='js' />
      )
    }
  }
];
