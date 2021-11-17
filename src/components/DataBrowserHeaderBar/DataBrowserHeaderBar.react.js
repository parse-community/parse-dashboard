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
import ContextMenu         from 'components/ContextMenu/ContextMenu.react';

export default class DataBrowserHeaderBar extends React.Component {

  constructor(props) {
    super(props);
    this.setContextMenu = this.setContextMenu.bind(this);
  }

  setContextMenu(contextMenuX, contextMenuY, contextMenuItems) {
    this.setState({ contextMenuX, contextMenuY, contextMenuItems });
  }

  render() {
    let { headers, onResize, selectAll, onAddColumn, updateOrdering, readonly, preventSchemaEdits, selected, onAddSort, onNewSort } = this.props;
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
            onAddSort={onAddSort}
            onNewSort={onNewSort}
            setContextMenu={this.setContextMenu}
            moveDataBrowserHeader={this.props.handleDragDrop}/>
          {this.state && this.state.contextMenuX && <ContextMenu
            x={this.state.contextMenuX - 280}
            y={this.state.contextMenuY - 80}
            items={this.state.contextMenuItems}
          />}
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
            <a
              href='javascript:;'
              role='button'
              className={styles.addColumnButton}
              onClick={onAddColumn}>
              Add a new column
            </a>
          </div>
        )
      );
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <div className={styles.bar}>{elements}</div>
      </DndProvider>
    )
  }
}
