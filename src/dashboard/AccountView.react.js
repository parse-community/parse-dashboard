/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import { buildAccountSidebar } from './SidebarBuilder';
import SidebarToggle from 'components/Sidebar/SidebarToggle.react';
import styles from 'dashboard/Dashboard.scss';

export default class AccountView extends React.Component {
  render() {
    let sidebar = buildAccountSidebar({
      section: this.props.section,
      subsection: this.props.subsection
    });

    return (
      <div className={styles.dashboard}>
        <div className={styles.content}>
          {this.props.children}
        </div>
        {sidebar}
        <SidebarToggle />
      </div>
    );
  }
}
