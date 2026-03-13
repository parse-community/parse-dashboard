/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Icon from 'components/Icon/Icon.react';
import styles from 'components/Sidebar/MobileNav.scss';

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="5" x2="17" y2="5" />
    <line x1="3" y1="10" x2="17" y2="10" />
    <line x1="3" y1="15" x2="17" y2="15" />
  </svg>
);

const MobileNav = ({ appName, isOpen, onToggle }) => {
  return (
    <>
      <div className={styles.mobileHeader}>
        <button className={styles.hamburger} onClick={onToggle} aria-label="Toggle navigation">
          {isOpen ? <Icon name="x-outline" width={20} height={20} fill="currentColor" /> : <HamburgerIcon />}
        </button>
        <span className={styles.appName}>{appName || 'Parse Dashboard'}</span>
      </div>
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  );
};

export default MobileNav;
