/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/Sidebar/Sidebar.scss';
import Icon           from 'components/Icon/Icon.react';

function toggleSidebarExpansion() {
  if (document.body.className.indexOf(' expanded') > -1) {
    document.body.className = document.body.className.replace(' expanded', '');
  } else {
    document.body.className += ' expanded';
  }
}

let SidebarToggle = () => <a className={styles.toggle} onClick={toggleSidebarExpansion}><Icon width={24} height={24} name='hamburger' fill={'#009AF1'} /></a>;

export default SidebarToggle;
