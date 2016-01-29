import React  from 'react';
import styles from 'components/Pill/Pill.scss';
//TODO: (peterjs) - refactor, may want to move onClick outside or need to make onClick able to handle link/button a11y
let Pill = ({ value, onClick }) => (
  <span className={[styles.pill, onClick ? styles.action : void(0)].join(' ')} onClick={onClick}>{value}</span>
);

export default Pill;
