/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DataBrowserHeader   from 'components/DataBrowserHeader/DataBrowserHeader.react';
import HTML5Backend        from 'react-dnd-html5-backend';
import React               from 'react';
import { DragDropContext } from 'react-dnd';

export const component = DataBrowserHeader;

let lightBg = { background: 'rgba(224,224,234,0.10)' };

@DragDropContext(HTML5Backend)
class HeadersDemo extends React.Component {
  render() {
    return (
      <div style={{ height: 30, background: '#66637A' }}>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='objectId' type='Special' />
        </div>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='createdAt' type='Date' style={lightBg} />
        </div>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='updatedAt' type='Date' />
        </div>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='name' type='String' style={lightBg} />
        </div>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='owner' type='Pointer<_User>' />
        </div>
        <div style={{ float: 'left', width: 140 }}>
          <DataBrowserHeader name='really_long_column_name_that_overflows' type='String' style={lightBg} />
        </div>
      </div>
    );
  }
}

export const demos = [
  {
    render: () => (
      <HeadersDemo />
    )
  }
];
