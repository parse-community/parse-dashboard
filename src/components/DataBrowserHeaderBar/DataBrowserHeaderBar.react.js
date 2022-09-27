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
import styles              from 'components/DataBrowserHeaderBar/DataBrowserHeaderBar.scss';
import { DndProvider }     from 'react-dnd'

export default class DataBrowserHeaderBar extends React.Component {
  render() {
    let { headers, onResize, selectAll, onAddColumn, updateOrdering, readonly, preventSchemaEdits, selected, isDataLoaded } = this.props;
    let elements = [
      <div key='check' className={[styles.wrap, styles.check].join(' ')}>
        {readonly
          ? null
          : <input
              type='checkbox'
              checked={selected}
              onChange={(e) => selectAll(e.target.checked)} />
        }
      </div>
    ];

    headers.forEach(({ width, name, type, targetClass, order, visible, preventSort }, i) => {
      if (!visible) return;
      let wrapStyle = { width };
      if (i % 2) {
        wrapStyle.background = '#726F85';
      } else {
        wrapStyle.background = '#66637A';
      }
      let onClick = null;
      if (!preventSort && (type === 'String' || type === 'Number' || type === 'Date' || type === 'Boolean')) {
        onClick = () => updateOrdering((order === 'descending' ? '' : '-') + name);
      }

      let className = styles.wrap;
      if (preventSort) {
        className += ` ${styles.preventSort} `;
      }

      elements.push(
        <div
          onClick={onClick}
          key={'header' + i}
          className={className}
          style={ wrapStyle }>
          <DataBrowserHeader
            name={name}
            type={type}
            targetClass={targetClass}
            order={order}
            index={i}
            moveDataBrowserHeader={this.props.handleDragDrop}/>
        </div>
      );
      elements.push(
        <DragHandle key={'handle' + i} className={styles.handle} onDrag={onResize.bind(null, i)} />
      );
    });

    if (onAddColumn) {
      let finalStyle = {};
      if (headers.length % 2) {
        finalStyle.background = 'rgba(224,224,234,0.10)';
      }

      elements.push(
        readonly || preventSchemaEdits ? null : (
          <div key='add' className={styles.addColumn} style={finalStyle}>
            <button
              type='button'
              className={styles.addColumnButton}
              onClick={onAddColumn}>
              Add a new column
            </button>
          </div>
        )
      );
    }

    function renderSkeleton() {
      if (isDataLoaded) return null;
      var skeletons = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
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
    )
  }
}
