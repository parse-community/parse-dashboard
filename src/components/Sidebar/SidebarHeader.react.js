/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon           from 'components/Icon/Icon.react';
import { Link }       from 'react-router';
import React          from 'react';
import styles         from 'components/Sidebar/Sidebar.scss';
// get the package.json environment variable
const version = process.env.version;

let SidebarHeader = () =>
<div className={styles.header}>
  <Link className={styles.logo} to={{ pathname: '/apps' }}>
    <Icon width={28} height={28} name='infinity' fill={'#ffffff'} />
  </Link>
  <Link to='/apps'>
    <div className={styles.version}>
      <div>Parse Dashboard {version}</div>
    </div>
  </Link>
</div>

export default SidebarHeader
