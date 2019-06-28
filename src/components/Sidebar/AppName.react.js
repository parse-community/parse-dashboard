import React from 'react';
import styles from 'components/Sidebar/Sidebar.scss';

export default ({ name, onClick }) => (
  <div className={styles.currentApp} onClick={onClick}>
    {name}
  </div>
);
