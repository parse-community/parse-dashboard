import React from 'react';
import styles from 'components/Sidebar/Sidebar.scss';

export default ({ name, pin, onClick }) => (
  <div className={styles.currentApp}>
    <div className={styles.currentAppNameGroup} onClick={onClick}>
      <div className={styles.currentAppName}>
        {name}
      </div>
      <div className={styles.appsSelectorArrow}></div>
    </div>
    {pin}
  </div>
);
