import React  from 'react';
import styles from 'components/BrowserMenu/BrowserMenu.scss';

let MenuItem = ({ text, disabled, onClick }) => {
  let classes = [styles.item];
  if (disabled) {
    classes.push(styles.disabled);
  }
  return <div className={classes.join(' ')} onClick={disabled ? undefined : onClick}>{text}</div>;
};

export default MenuItem;
