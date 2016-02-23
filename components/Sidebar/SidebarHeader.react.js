/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager from 'lib/AccountManager';
import { getToken }   from 'lib/CSRFManager';
import getSiteDomain  from 'lib/getSiteDomain';
import Icon           from 'components/Icon/Icon.react';
import { Link }       from 'react-router';
import React          from 'react';
import styles         from 'components/Sidebar/Sidebar.scss';
// As long as we use refs, this can't be a stateless component
export default class SidebarHeader extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
      <div className={styles.header}>
        <Link className={styles.logo} to='/apps'>
          <Icon width={28} height={28} name='infinity' fill={'#ffffff'} />
        </Link>
        <form ref='switch' method='post' action={`${getSiteDomain()}/account/swap_dashboard`}>
          <input type='hidden' name='authenticity_token' value={getToken()} />
        </form>
        <div className={styles.version}>
          <div>Parse Dashboard</div>
        </div>
        <div className={styles.account}>
          <Link to='/account'>{AccountManager.currentUser().email}</Link>
        </div>
      </div>
    );
  }
}
