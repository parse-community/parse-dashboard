import React from 'react';

import Icon  from 'components/Icon/Icon.react';

import HamburgerButton from 'components/back4App/HamburgerButton/HamburgerButton.react';
import Logo from 'components/back4App/Logo/Logo.react';
import Nav from 'components/back4App/HeaderNav/HeaderNav.react';

import styles from 'components/back4App/Header/Header.scss';

export default () => (
  <header className={styles.header}>
    <HamburgerButton />
    <Logo />
    <Nav />
  </header>
);
