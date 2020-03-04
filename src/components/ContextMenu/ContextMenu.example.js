/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import ContextMenu from 'components/ContextMenu/ContextMenu.react';

export const component = ContextMenu;

export const demos = [
  {
    name: 'Context menu',
    render: () => (
      <div style={{
        position: 'relative',
        height: '100px'
      }}>
        <ContextMenu
          x={0}
          y={0}
          items={[
            {
              text: 'Category 1', items: [
                { text: 'C1 Item 1', callback: () => { alert('C1 Item 1 clicked!') } },
                { text: 'C1 Item 2', callback: () => { alert('C1 Item 2 clicked!') } },
                {
                  text: 'Sub Category 1', items: [
                    { text: 'SC1 Item 1', callback: () => { alert('SC1 Item 1 clicked!') } },
                    { text: 'SC1 Item 2', callback: () => { alert('SC1 Item 2 clicked!') } },
                  ]
                }
              ]
            },
            {
              text: 'Category 2', items: [
                { text: 'C2 Item 1', callback: () => { alert('C2 Item 1 clicked!') } },
                { text: 'C2 Item 2', callback: () => { alert('C2 Item 2 clicked!') } }
              ]
            }
          ]}
        />
      </div>
    )
  }
];
