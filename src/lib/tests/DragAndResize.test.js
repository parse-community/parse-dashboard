/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ResizableBox } from 'react-resizable';
import CanvasElement from '../../dashboard/Data/CustomDashboard/CanvasElement.react';

// The dashboard drags and resizes with react-draggable, through react-rnd
// (custom dashboard canvas elements) and react-resizable (data browser panels).
// These tests render with react-dom and dispatch native mouse events, because
// react-draggable listens on the document for the mouse moves of a drag.
global.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(element) {
  act(() => {
    root.render(element);
  });
}

// Dispatch a native mouse event with the primary button
function dispatchMouseEvent(target, type, { x, y }) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y })
    );
  });
}

// A drag starts with a mousedown on the dragged node, then react-draggable
// tracks mousemove and mouseup on the document
function drag(target, from, to) {
  dispatchMouseEvent(target, 'mousedown', from);
  dispatchMouseEvent(document, 'mousemove', to);
  dispatchMouseEvent(document, 'mouseup', to);
}

describe('Canvas element drag', () => {
  const element = { id: 'element-1', x: 100, y: 50, width: 300, height: 200 };

  function renderCanvasElement() {
    const props = {
      onSelect: jest.fn(),
      onPositionChange: jest.fn(),
      onSizeChange: jest.fn(),
      onDrag: jest.fn(),
      onResize: jest.fn(),
    };
    render(
      <CanvasElement element={element} isSelected={false} {...props}>
        <div>Content</div>
      </CanvasElement>
    );
    return props;
  }

  it('moves the element when dragged by the drag handle', () => {
    const { onDrag, onPositionChange } = renderCanvasElement();
    drag(container.querySelector('.dragHandle'), { x: 10, y: 10 }, { x: 110, y: 60 });
    expect(onDrag).toHaveBeenCalledWith('element-1', 200, 100, 300, 200);
    expect(onPositionChange).toHaveBeenCalledTimes(1);
    expect(onPositionChange).toHaveBeenCalledWith('element-1', 200, 100);
  });

  it('snaps the position to the 50px drag grid', () => {
    const { onPositionChange } = renderCanvasElement();
    // Moving 120px right and 20px down snaps to 100px right and 0px down
    drag(container.querySelector('.dragHandle'), { x: 10, y: 10 }, { x: 130, y: 30 });
    expect(onPositionChange).toHaveBeenCalledWith('element-1', 200, 50);
  });

  it('does not move the element when dragged by its content', () => {
    const { onDrag, onPositionChange } = renderCanvasElement();
    drag(container.querySelector('.elementContent'), { x: 10, y: 10 }, { x: 110, y: 60 });
    expect(onDrag).not.toHaveBeenCalled();
    expect(onPositionChange).not.toHaveBeenCalled();
  });
});

describe('Data browser panel resize', () => {
  // Same ResizableBox configuration as the aggregation and graph panels in
  // DataBrowser.react.js: a west handle and a width between a min and a max
  function renderPanel() {
    const props = {
      onResizeStart: jest.fn(),
      onResize: jest.fn(),
      onResizeStop: jest.fn(),
    };
    render(
      <ResizableBox
        width={300}
        height={Infinity}
        minConstraints={[100, Infinity]}
        maxConstraints={[500, Infinity]}
        resizeHandles={['w']}
        {...props}
      >
        <div>Panel</div>
      </ResizableBox>
    );
    return props;
  }

  function dragWestHandle(fromX, toX) {
    drag(
      container.querySelector('.react-resizable-handle-w'),
      { x: fromX, y: 10 },
      { x: toX, y: 10 }
    );
  }

  // Only the width is checked, because the panels have no finite height
  function lastWidth(callback) {
    return callback.mock.lastCall[1].size.width;
  }

  it('widens the panel when the west handle is dragged left', () => {
    const { onResizeStart, onResize, onResizeStop } = renderPanel();
    dragWestHandle(400, 350);
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(lastWidth(onResize)).toBe(350);
    expect(onResizeStop).toHaveBeenCalledTimes(1);
    expect(lastWidth(onResizeStop)).toBe(350);
    expect(container.querySelector('.react-resizable').style.width).toBe('350px');
  });

  it('narrows the panel when the west handle is dragged right', () => {
    const { onResize, onResizeStop } = renderPanel();
    dragWestHandle(400, 450);
    expect(lastWidth(onResize)).toBe(250);
    expect(lastWidth(onResizeStop)).toBe(250);
  });

  it('limits the width to the maximum', () => {
    const { onResize, onResizeStop } = renderPanel();
    dragWestHandle(400, 100);
    expect(lastWidth(onResize)).toBe(500);
    expect(lastWidth(onResizeStop)).toBe(500);
  });

  it('limits the width to the minimum', () => {
    const { onResize, onResizeStop } = renderPanel();
    dragWestHandle(400, 650);
    expect(lastWidth(onResize)).toBe(100);
    expect(lastWidth(onResizeStop)).toBe(100);
  });
});
