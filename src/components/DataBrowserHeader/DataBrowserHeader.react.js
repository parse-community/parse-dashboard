/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React, { useRef } from 'react';
import styles from 'components/DataBrowserHeader/DataBrowserHeader.scss';
import baseStyles from 'stylesheets/base.scss';
import { useDrag, useDrop } from 'react-dnd';

const Types = {
  DATA_BROWSER_HEADER: 'dataBrowserHeader',
};

function DataBrowserHeader({ name, type, targetClass, order, style, index, moveDataBrowserHeader }) {
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: Types.DATA_BROWSER_HEADER,
      collect: monitor => ({ isOver: monitor.isOver() }),
      drop: item => {
        if (!item || item.index === index) {
          return;
        }
        moveDataBrowserHeader(item.index, index);
      },
    }),
    [index, moveDataBrowserHeader]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: Types.DATA_BROWSER_HEADER,
      item: { name, index },
      collect: monitor => ({ isDragging: monitor.isDragging() }),
    }),
    [name, index]
  );

  drag(drop(ref));

  const classes = [styles.header, baseStyles.unselectable];
  if (order) {
    classes.push(styles[order]);
  }
  if (isOver && !isDragging) {
    classes.push(styles.over);
  }
  if (isDragging) {
    classes.push(styles.dragging);
  }

  return (
    <div ref={ref} className={classes.join(' ')} style={style}>
      <div className={styles.name}>{name}</div>
      <div className={styles.type}>{targetClass ? `${type} <${targetClass}>` : type}</div>
    </div>
  );
}

export default DataBrowserHeader;

DataBrowserHeader.propTypes = {
  name: PropTypes.string.isRequired.describe('The name of the column.'),
  type: PropTypes.string.describe('The type of the column.'),
  targetClass: PropTypes.string.describe('The target class for a Pointer or Relation.'),
  order: PropTypes.oneOf(['ascending', 'descending']).describe(
    'A sort ordering that displays as an arrow in the header.'
  ),
};
