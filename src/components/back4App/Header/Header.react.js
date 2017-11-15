import React from 'react';

import Media from 'react-media';

import Icon  from 'components/Icon/Icon.react';

import HamburgerButton from 'components/back4App/HamburgerButton/HamburgerButton.react';
import Logo from 'components/back4App/Logo/Logo.react';
import Nav from 'components/back4App/HeaderNav/HeaderNav.react';
import Dropdown from 'components/back4App/Dropdown/Dropdown.react';
import Button from 'components/back4App/Button/Button.react';

import styles from 'components/back4App/Header/Header.scss';

import headerNavData from 'components/back4App/Header/headerNavData.js';

let Header = props => (
  <header className={styles.header}>
    <div className={styles['left-side']}>
      <div className={styles['hamburger-wrapper']}>
        <HamburgerButton />
      </div>
      <a className={styles['logo-wrapper']} href="http://www.back4app.com/">
        {/* <Logo width={46} height={46} symbol /> */}
        <Logo width={124} height={80} text />
      </a>
    </div>

    <div className={styles['right-side']}>
      <Nav items={headerNavData.items} />
      <Media query="(min-width: 1100px)">
        <div className="ml-auto">
          <Dropdown items={headerNavData.dropdownItems}>Hello, TBrayner!<i className="dropdown-icon zmdi zmdi-caret-down"></i></Dropdown>
          <Button color="green" weight="700" url="http://localhost:8090/apps/#!/apps/new">NEW APP</Button>
        </div>
      </Media>
    </div>
  </header>
);

export default Header;
