/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CascadingView from 'components/CascadingView/CascadingView.react';
import React         from 'react';

export const component = CascadingView;

export const demos = [
  {
    render: () => (
      <CascadingView
        style={{ padding: '15px', border: '1px solid #e3e3e3' }}
        content={'Element with children'}>
        <CascadingView
          content={'Element with child'}>
          <div>Element without child</div>
          <div>Also element without child</div>
        </CascadingView>
        <div>Element without child</div>
      </CascadingView>
    )
  },
  {
    render: () => {
      let contents = [];
      for (let i = 0; i < 4; ++i) {
        contents.push(
          <CascadingView
            style={{ padding: '15px', border: '1px solid #e3e3e3' }}
            content={'Element with children'}
            key={i}>
            <CascadingView
              content={'Element with child'}>
              <div>Element without child</div>
              <div>Also element without child</div>
            </CascadingView>
            <div>Element without child</div>
          </CascadingView>
        );
      }
      return (
        <div>
          {contents}
        </div>
      );
    }
  }
];
