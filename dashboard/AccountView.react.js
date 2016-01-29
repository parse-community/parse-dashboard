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
