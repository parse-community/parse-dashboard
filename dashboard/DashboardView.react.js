/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import check_gatekeeper from 'lib/check_gatekeeper';
import ParseApp         from 'lib/ParseApp';
import React            from 'react';
import Sidebar          from 'components/Sidebar/Sidebar.react';
import SidebarToggle    from 'components/Sidebar/SidebarToggle.react';
import styles           from 'dashboard/Dashboard.scss';

export default class DashboardView extends React.Component {

  /* A DashboardView renders two pieces: the sidebar, and the app itself */
  render() {
    let sidebarChildren = null;
    if (typeof this.renderSidebar === 'function') {
      sidebarChildren = this.renderSidebar();
    }
    let appSlug = (this.context.currentApp ? this.context.currentApp.slug : '');

    if (!this.context.currentApp.hasCheckedForMigraton) {
      this.context.currentApp.getMigrations().promise.then(() => this.forceUpdate());
    }

    let coreSubsections = [
      {
        name: 'Browser',
        link: '/browser'
      }, {
        name: 'Cloud Code',
        link: '/cloud_code'
      }, {
        name: 'Webhooks',
        link: '/webhooks'
      }, {
        name: 'Jobs',
        link: '/jobs'
      }, {
        name: 'Logs',
        link: '/logs'
      }, {
        name: 'Config',
        link: '/config'
      }, {
        name: 'API Console',
        link: '/api_console'
      },
    ];

    if (this.context.currentApp.migration) {
      coreSubsections.push({
        name: 'Migration',
        link: '/migration',
      });
    }

    let appSidebarSections = [
      {
        name: 'Core',
        icon: 'core',
        link: '/browser',
        subsections: coreSubsections,
      }, {
        name: 'Push',
        icon: 'push-outline',
        link: '/push',
        style: {paddingLeft: '16px'},
        subsections: [
          {
            name: 'Activity',
            link: '/push/activity'
          }, {
            name: 'Audiences',
            link: '/push/audiences'
          }
        ]
      }, {
        name: 'Analytics',
        icon: 'analytics-outline',
        link: '/analytics',
        subsections: [
          {
            name: 'Overview',
            link: '/analytics/overview'
          }, {
            name: 'Explorer',
            link: '/analytics/explorer'
          }, {
            name: 'Retention',
            link: '/analytics/retention'
          }, {
            name: 'Performance',
            link: '/analytics/performance'
          }, {
            name: 'Slow Queries',
            link: '/analytics/slow_queries'
          }
        ]
      }, {
        name: 'App Settings',
        icon: 'gear-solid',
        link: '/settings',
        subsections: [
          {
            name: 'General',
            link: '/settings/general'
          }, {
            name: 'Security & Keys',
            link: '/settings/keys'
          }, {
            name: 'Users',
            link: '/settings/users'
          }, {
            name: 'Push',
            link: '/settings/push'
          }, {
            name: 'Hosting and Emails',
            link: '/settings/hosting'
          },
        ]
      }
    ];

    let sidebar = (
    <Sidebar
      sections={appSidebarSections}
      appSelector={true}
      section={this.section}
      subsection={this.subsection}
      prefix={'/apps/' + appSlug}
      action={this.action}>
      {sidebarChildren}
    </Sidebar>);

    return (
      <div className={styles.dashboard}>
        <div className={styles.content}>
          {this.renderContent()}
        </div>
        {sidebar}
        <SidebarToggle />
      </div>
    );
  }
}

DashboardView.contextTypes = {
  generatePath: React.PropTypes.func,
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
