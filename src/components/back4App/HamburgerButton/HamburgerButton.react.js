import React from 'react';
import styles from 'components/back4App/HamburgerButton/HamburgerButton.scss';

export default props => (
  <button className={styles.hamburgerButton} type="button" onClick={props.onClick}>
    <i className="zmdi zmdi-menu"></i>
  </button>
);
