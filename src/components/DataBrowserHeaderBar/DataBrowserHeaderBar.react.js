/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DataBrowserHeader from 'components/DataBrowserHeader/DataBrowserHeader.react';
import DragHandle from 'components/DragHandle/DragHandle.react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React from 'react';
import styles from 'components/DataBrowserHeaderBar/DataBrowserHeaderBar.scss';
import { DndProvider } from 'react-dnd';

export default class DataBrowserHeaderBar extends React.Component {
  handleContextMenu = (index, event) => {
    event.preventDefault();
    const {
      freezeIndex,
      freezeColumns,
      unfreezeColumns,
      setContextMenu,
      showRowNumber,
      setShowRowNumber,
    } = this.props;
    const items = [
      {
        text: showRowNumber ? 'Hide row number' : 'Display row number',
        callback: () => setShowRowNumber(!showRowNumber),
      },
      freezeIndex >= 0 && index <= freezeIndex
        ? { text: 'Unfreeze column', callback: () => unfreezeColumns() }
        : { text: 'Freeze column', callback: () => freezeColumns(index) },
    ];
    setContextMenu(event.pageX, event.pageY, items);
  };

  render() {
    const {
      headers,
      onResize,
      selectAll,
      onAddColumn,
      updateOrdering,
      readonly,
      preventSchemaEdits,
      selected,
      indeterminate,
      isDataLoaded,
      setSelectedObjectId,
      setCurrent,
      stickyLefts,
      handleLefts,
      freezeIndex,
      showRowNumber,
      rowNumberWidth,
    } = this.props;
    const elements = [
      <div
        key="check"
        className={[styles.wrap, styles.check].join(' ')}
        style={{ position: 'sticky', left: 0, zIndex: 11 }}
      >
        {readonly ? null : (
          <input
            type="checkbox"
            checked={selected}
            ref={input => {
              if (input) {
                input.indeterminate = indeterminate;
              }
            }}
            onChange={e => selectAll(e.target.checked)}
          />
        )}
      </div>,
    ];

    if (showRowNumber) {
      elements.push(
        <div
          key="rowNumber"
          className={[styles.wrap, styles.rowNumber].join(' ')}
          style={{ position: 'sticky', left: 30, zIndex: 11, width: rowNumberWidth }}
        >
          #
        </div>
      );
    }

    headers.forEach(({ width, name, type, targetClass, order, visible, preventSort }, i) => {
      if (!visible) {
        return;
      }
      const wrapStyle = { width };
      if (freezeIndex >= 0 && typeof stickyLefts[i] !== 'undefined' && i <= freezeIndex) {
        wrapStyle.position = 'sticky';
        wrapStyle.left = stickyLefts[i];
        wrapStyle.zIndex = 11;
      }
      if (i % 2) {
        wrapStyle.background = '#726F85';
      } else {
        wrapStyle.background = '#66637A';
      }
      let onClick = null;
      if (
        !preventSort &&
        (type === 'String' || type === 'Number' || type === 'Date' || type === 'Boolean')
      ) {
        onClick = () => {
          updateOrdering((order === 'descending' ? '' : '-') + name);
          setSelectedObjectId(null);
          setCurrent(null);
        };
      }

      let className = styles.wrap;
      if (preventSort) {
        className += ` ${styles.preventSort} `;
      }

      elements.push(
        <div
          onClick={onClick}
          onContextMenu={e => this.handleContextMenu(i, e)}
          key={'header' + i}
          className={className}
          style={wrapStyle}
        >
          <DataBrowserHeader
            name={name}
            type={type}
            targetClass={targetClass}
            order={order}
            index={i}
            moveDataBrowserHeader={this.props.handleDragDrop}
          />
        </div>
      );
      const handleStyle = {};
      if (freezeIndex >= 0 && typeof handleLefts[i] !== 'undefined' && i <= freezeIndex) {
        handleStyle.position = 'sticky';
        handleStyle.left = handleLefts[i];
        handleStyle.zIndex = 11;
        if (i === freezeIndex) {
          handleStyle.marginRight = 0;
          handleStyle.width = 4;
        } else {
          handleStyle.background = wrapStyle.background;
        }
      }
      elements.push(
        <DragHandle
          key={'handle' + i}
          className={styles.handle}
          onDrag={onResize.bind(null, i)}
          style={handleStyle}
        />
      );
    });

    if (onAddColumn) {
      const finalStyle = {};
      if (headers.length % 2) {
        finalStyle.background = '#726F85';
      } else {
        finalStyle.background = '#66637A';
      }

      elements.push(
        readonly || preventSchemaEdits ? null : (
          <div key="add" className={styles.addColumn} style={finalStyle}>
            <button type="button" className={styles.addColumnButton} onClick={onAddColumn}>
              Add a new column
            </button>
          </div>
        )
      );
    }

    function renderSkeleton() {
      if (isDataLoaded) {
        return null;
      }
      const skeletons = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
      return (
        <div className={styles.skeleton}>
          {skeletons.map(function (opacity, index) {
            return (
              <div
                key={index}
                className={styles.skeletonRow}
                style={{
                  opacity,
                }}
              ></div>
            );
          })}
        </div>
      );
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <div className={styles.bar}>
          {elements}
          {renderSkeleton()}
        </div>
      </DndProvider>
    );
  }
}
