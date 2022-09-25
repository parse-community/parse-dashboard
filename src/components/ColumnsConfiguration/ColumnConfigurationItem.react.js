import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

import Icon from 'components/Icon/Icon.react';
import styles from 'components/ColumnsConfiguration/ColumnConfigurationItem.scss';

const DND_TYPE = 'ColumnConfigurationItem';

export default ({ name, handleColumnDragDrop, index, onChangeVisible, visible }) => {
  const [ { isDragging}, drag ] = useDrag({
    item: { type: DND_TYPE, index },
		collect: monitor => ({ isDragging: !!monitor.isDragging() })
  });

  const [ { canDrop, isOver }, drop ] = useDrop({
    accept: DND_TYPE,
    drop: item => handleColumnDragDrop(item.index, index),
    canDrop: item => item.index !== index,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  return drag(drop(
    <section
      className={styles.columnConfigItem}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : null,
        backgroundColor: isOver && canDrop ? '#208aec' : null
      }}
      onClick={() => onChangeVisible(!visible)}>
      <div className={[styles.icon, styles.visibilityIcon].join(' ')}>
        <Icon name={visible ? 'visibility' : 'visibility_off'} width={18} height={18} fill={visible ? 'white' : 'rgba(0,0,0,0.4)'} />
      </div>
      <div className={styles.columnConfigItemName} title={name}>{name}</div>
      <div className={[styles.icon, styles.columnIcon].join(' ')}>
        <Icon name='drag-indicator' width={14} height={14} fill="white" />
      </div>
    </section>
  ));
};
