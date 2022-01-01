import React from 'react';
import Pin from 'components/Sidebar/Pin.react';
import styles from 'components/Sidebar/Sidebar.scss';

const AppName = ({ name, onClick, onPinClick }) => (
  <div>
    <div className={styles.currentApp}>
      <div className={styles.appNameContainer} onClick={onClick}>
        <div className={styles.currentAppName}>
          {name}
        </div>
      </div>
      <Pin onClick={onPinClick} />
    </div>
  </div>
);

export default AppName;
