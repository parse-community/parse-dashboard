import React from 'react';

import HeaderNavItem from 'components/back4App/HeaderNavItem/HeaderNavItem.react';

import styles from 'components/back4App/HeaderNav/HeaderNav.scss';

const _renderHeaderMenuItems = items => items.map((item, index) => <HeaderNavItem key={index} index={index} {...item} />);

let HeaderNav = props => (
  <nav className={styles.nav}>
    <ul className={styles.menu}>
      {_renderHeaderMenuItems(props.items)}
    </ul>
  </nav>
);

export default HeaderNav;
