/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import { Rnd } from 'react-rnd';
import styles from './CanvasElement.scss';

const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDrag,
  onResize,
  children,
}) => {
  const handleDrag = (e, d) => {
    if (onDrag) {
      onDrag(element.id, d.x, d.y, element.width, element.height);
    }
  };

  const handleDragStop = (e, d) => {
    onPositionChange(element.id, d.x, d.y);
  };

  const handleResize = (e, direction, ref, delta, position) => {
    if (onResize) {
      onResize(element.id, ref.offsetWidth, ref.offsetHeight, position.x, position.y);
    }
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    onSizeChange(
      element.id,
      ref.offsetWidth,
      ref.offsetHeight,
      position.x,
      position.y
    );
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  return (
    <Rnd
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      dragGrid={[50, 50]}
      resizeGrid={[50, 50]}
      minWidth={100}
      minHeight={50}
      dragHandleClassName={styles.dragHandle}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      className={`${styles.canvasElement} ${isSelected ? styles.selected : ''} canvasElementWrapper`}
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      resizeHandleClasses={{
        bottomRight: styles.resizeHandleVisible,
      }}
    >
      <div className={styles.dragHandle} />
      <div className={styles.elementContent} onClick={handleClick}>
        {children}
      </div>
    </Rnd>
  );
};

export default CanvasElement;
