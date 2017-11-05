import React from 'react';

import HeaderNavItem from 'components/back4App/HeaderNavItem/HeaderNavItem.react';

import styles from 'components/back4App/HeaderNav/HeaderNav.scss';

const _renderHeaderMenuItems = items => items.map((item, index) => (
  item.url ?
  <HeaderNavItem key={index} label={item.label} url={item.url} /> :
  <HeaderNavItem key={index} label={item.label} items={item.items} />
));

let HeaderNav = props => (
  <nav className={styles.nav}>
    <ul className={styles.menu}>
      {_renderHeaderMenuItems(props.items)}
    </ul>
  </nav>
);

export default HeaderNav;
