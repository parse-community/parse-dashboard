import React from 'react';
import styles from './TimeZoneToggle.scss';

const TimeZoneToggle = ({ value, onChange }) => {
  const switchStyle = {
    backgroundColor: value ? 'rgb(0, 219, 124)' : 'rgb(204, 204, 204)',
    transition: 'background-color 0.15s ease-out'
  };

  return (
    <div className={styles.container} onClick={() => onChange(!value)}>
      <div className={`${styles.switch} ${value ? styles.right : styles.left}`} style={switchStyle}>
        <span className={styles.option}>{value ? 'Local' : 'UTC'}</span>
        <span className={styles.slider} />
      </div>
    </div>
  );
};

export default TimeZoneToggle; 