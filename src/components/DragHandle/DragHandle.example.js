/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DataBrowserHeader   from 'components/DataBrowserHeader/DataBrowserHeader.react';
import DragHandle          from 'components/DragHandle/DragHandle.react';
import HTML5Backend        from 'react-dnd-html5-backend';
import React               from 'react';
import { DragDropContext } from 'react-dnd';

export const component = DragHandle;

class DragDemo extends React.Component {
  constructor() {
    super();

    this.state = { x: 100, y: 100 };
  }

  handleDrag(dx, dy) {
    this.setState(({ x, y }) => {
      let newX = Math.max(0, Math.min(x + dx, 480));
      let newY = Math.max(0, Math.min(y + dy, 480));
      return { x: newX, y: newY };
    });
  }

  render() {
    let style = {
      width: 20,
      height: 20,
      background: '#5298fc',
      borderRadius: 10,
      cursor: 'move',
      position: 'absolute',
      left: this.state.x,
      top: this.state.y
    };
    return (
      <div style={{
        position: 'relative',
        width: 500,
        height: 500,
        border: '1px solid #e3e3e3',
        margin: '40px auto'
      }}>
        <DragHandle onDrag={this.handleDrag.bind(this)} style={style} />
      </div>
    );
  }
}

let lightBg = { background: 'rgba(224,224,234,0.10)' };
let handleStyle = {
  position: 'relative',
  display: 'inline-block',
  width: 4,
  height: 30,
  marginLeft: -2,
  marginRight: -2,
  cursor: 'ew-resize'
};

@DragDropContext(HTML5Backend)
class HeadersDemo extends React.Component {
  constructor() {
    super();

    this.state = {
      widths: [
        140,
        140,
        140,
        140,
        140,
        140
      ]
    };
  }

  handleDrag(index, dx) {
    this.setState(({ widths }) => {
      widths[index] = Math.max(40, widths[index] + dx);
      return { widths };
    });
  }

  render() {
    return (
      <div style={{ height: 30, background: '#66637A', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', width: this.state.widths[0] }}>
          <DataBrowserHeader name='objectId' type='Special' />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 0)} />
        <div style={{ display: 'inline-block', width: this.state.widths[1] }}>
          <DataBrowserHeader name='createdAt' type='Date' style={lightBg} />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 1)} />
        <div style={{ display: 'inline-block', width: this.state.widths[2] }}>
          <DataBrowserHeader name='updatedAt' type='Date' />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 2)} />
        <div style={{ display: 'inline-block', width: this.state.widths[3] }}>
          <DataBrowserHeader name='name' type='String' style={lightBg} />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 3)} />
        <div style={{ display: 'inline-block', width: this.state.widths[4] }}>
          <DataBrowserHeader name='owner' type='Pointer<_User>' />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 4)} />
        <div style={{ display: 'inline-block', width: this.state.widths[5] }}>
          <DataBrowserHeader name='really_long_column_name_that_overflows' type='String' style={lightBg} />
        </div>
        <DragHandle style={handleStyle} onDrag={this.handleDrag.bind(this, 5)} />
      </div>
    );
  }
}

export const demos = [
  {
    name: 'Drag the ball',
    render: () => (
      <DragDemo />
    )
  }, {
    name: 'Data Browser Headers',
    render: () => (
      <HeadersDemo />
    )
  }
];
