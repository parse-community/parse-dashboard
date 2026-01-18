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
  children,
}) => {
  const handleDragStop = (e, d) => {
    onPositionChange(element.id, d.x, d.y);
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
      dragGrid={[16, 16]}
      resizeGrid={[16, 16]}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      dragHandleClassName={styles.dragHandle}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      className={`${styles.canvasElement} ${isSelected ? styles.selected : ''}`}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      resizeHandleClasses={{
        top: styles.resizeHandle,
        right: styles.resizeHandle,
        bottom: styles.resizeHandle,
        left: styles.resizeHandle,
        topRight: styles.resizeHandle,
        bottomRight: styles.resizeHandle,
        bottomLeft: styles.resizeHandle,
        topLeft: styles.resizeHandle,
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
