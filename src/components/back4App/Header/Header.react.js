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
      <Media query="(max-width: 1099px)">
        <div className={styles['hamburger-wrapper']}>
          <HamburgerButton />
        </div>
      </Media>
      <Media query="(min-width: 1100px)">
        <a className={styles['logo-face']} href="http://www.back4app.com/">
          <Icon width={46} height={47} name='back4app-logo-face-blue' fill='#208AEC' />
        </a>
      </Media>
      <a className={styles['logo-text']} href="http://www.back4app.com/">
        <Icon width={134} height={53} name='back4app-logo-text-blue' fill='#208AEC' />
      </a>
    </div>

    <div className={styles['right-side']}>
      <Media query="(min-width: 1100px)">
        <Nav items={headerNavData.items} />
      </Media>

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
