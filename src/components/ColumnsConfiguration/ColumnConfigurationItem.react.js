import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import Icon from 'components/Icon/Icon.react';
import styles from 'components/ColumnsConfiguration/ColumnConfigurationItem.scss';

const DND_TYPE = 'ColumnConfigurationItem';

const ColumnConfigurationItem = ({ name, handleColumnDragDrop, index, onChangeVisible, visible }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { index },
      collect: monitor => ({ isDragging: !!monitor.isDragging() }),
    }),
    [index]
  );

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: DND_TYPE,
      drop: item => handleColumnDragDrop(item.index, index),
      canDrop: item => item.index !== index,
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [index, handleColumnDragDrop]
  );

  drag(drop(ref));

  return (
    <section
      ref={ref}
      className={styles.columnConfigItem}
      role="button"
      tabIndex={0}
      aria-pressed={visible}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : null,
        backgroundColor: isOver && canDrop ? '#208aec' : null,
      }}
      onClick={() => onChangeVisible(!visible)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChangeVisible(!visible);
        }
      }}
    >
      <div className={[styles.icon, styles.visibilityIcon].join(' ')}>
        <Icon
          name={visible ? 'visibility' : 'visibility_off'}
          width={18}
          height={18}
          fill={visible ? 'white' : 'rgba(0,0,0,0.4)'}
        />
      </div>
      <div className={styles.columnConfigItemName} title={name}>
        {name}
      </div>
      <div className={[styles.icon, styles.columnIcon].join(' ')}>
        <Icon name="drag-indicator" width={14} height={14} fill="white" />
      </div>
    </section>
  );
};

export default ColumnConfigurationItem;
