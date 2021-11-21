/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes                  from 'lib/PropTypes';
import React                      from 'react';
import styles                     from 'components/DataBrowserHeader/DataBrowserHeader.scss';
import { unselectable }           from 'stylesheets/base.scss';
import { DragSource, DropTarget } from 'react-dnd';

const Types = {
  DATA_BROWSER_HEADER: 'dataBrowserHeader'
};

const dataBrowserHeaderTarget = {
  drop(props, monitor) {
    const item = monitor.getItem();

    if (!item) {
      return;
    }

    const dragIndex = item.index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveDataBrowserHeader(dragIndex, hoverIndex);
  },
}

const dataBrowserHeaderSource = {
  beginDrag(props) {
    return {
      name: props.name,
      index: props.index,
    };
  }
};

@DropTarget(Types.DATA_BROWSER_HEADER, dataBrowserHeaderTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))
@DragSource(Types.DATA_BROWSER_HEADER, dataBrowserHeaderSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class DataBrowserHeader extends React.Component {

  onContextMenu(event) {
    if (event.type !== 'contextmenu') { return; }
    event.preventDefault();
    const { setContextMenu } = this.props
    const { pageX, pageY } = event;
    const menuItems = this.getContextMenuOptions();
    menuItems.length && setContextMenu(pageX, pageY, menuItems);
  }

  getContextMenuOptions() {
    const contextMenuOptions = [];
    contextMenuOptions.push({
      text: 'Add To ' + this.props.name + ' Sorting',
      callback: () => {
        let { onAddSort } = this.props;
        onAddSort(this.props.name);
      }
    });

    contextMenuOptions.push({
      text: 'Sort by ' + this.props.name + ' only',
      callback: () => {
        let { onNewSort } = this.props;
        onNewSort(this.props.name);
      }
    });

    contextMenuOptions.push({
      text: 'Copy column name',
      callback: () => {
        // let { objectId, onEditSelectedRow } = this.props;
        if (typeof (navigator.clipboard) == 'undefined') {
          console.log('navigator.clipboard');
          var textArea = document.createElement('textarea');
          textArea.value = this.props.name;
          textArea.style.position = 'fixed';  //avoid scrolling to bottom
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log(msg);
          } catch (err) {
            console.log('Was not possible to copy te text: ', err);
          }

          document.body.removeChild(textArea)
          return;
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(this.props.name).then(() => {
            console.log('Async: Copying to clipboard was successful!');
          }, (err) => {
            console.error('Async: Could not copy text: ', err);
          });
        }
      }
    });
    return contextMenuOptions;
  }

  render() {
    let { connectDragSource, connectDropTarget, name, type, targetClass, order, style, isDragging, isOver } = this.props;
    let classes = [styles.header, unselectable];
    if (order) {
      classes.push(styles[order]);
    }
    if (isOver && !isDragging) {
      classes.push(styles.over);
    }
    if (isDragging) {
      classes.push(styles.dragging);
    }
    return connectDragSource(connectDropTarget(
      <div className={classes.join(' ')} style={style} onContextMenu={this.onContextMenu.bind(this)}>
        <div className={styles.name}>{name}</div>
        <div className={styles.type}>{targetClass ? `${type} <${targetClass}>` : type}</div>
      </div>
    ));
  }
}

export default DataBrowserHeader;

DataBrowserHeader.propTypes = {
  name: PropTypes.string.isRequired.describe(
    'The name of the column.'
  ),
  type: PropTypes.string.describe(
    'The type of the column.'
  ),
  targetClass: PropTypes.string.describe(
    'The target class for a Pointer or Relation.'
  ),
  order: PropTypes.oneOf(['ascending', 'descending']).describe(
    'A sort ordering that displays as an arrow in the header.'
  ),
};
