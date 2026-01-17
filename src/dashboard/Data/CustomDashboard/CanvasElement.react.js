/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import { Rnd } from 'react-rnd';
import Icon from 'components/Icon/Icon.react';
import styles from './CanvasElement.scss';

const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDelete,
  onEdit,
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
        topRight: styles.resizeHandleCorner,
        bottomRight: styles.resizeHandleCorner,
        bottomLeft: styles.resizeHandleCorner,
        topLeft: styles.resizeHandleCorner,
      }}
    >
      <div className={styles.elementContent} onClick={handleClick}>
        {children}
      </div>
      {isSelected && (
        <div className={styles.elementControls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit"
          >
            <Icon name="edit-solid" width={12} height={12} fill="#ffffff" />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            title="Delete"
          >
            <Icon name="trash-solid" width={12} height={12} fill="#ffffff" />
          </button>
        </div>
      )}
    </Rnd>
  );
};

export default CanvasElement;
