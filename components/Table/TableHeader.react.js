import React  from 'react';
import styles from 'components/Table/Table.scss';

let TableHeader = ({ width, ...props }) => {
  let style = {};
  if (width !== undefined) {
    style.width = width + '%';
  }
  return <div {...props} style={style} className={styles.header} />;
}

export default TableHeader;
