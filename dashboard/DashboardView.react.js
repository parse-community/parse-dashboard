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

    let coreSubsections = []

    if (this.context.currentApp.enabledFeatures.dataBrowser) {
      coreSubsections.push({
        name: 'Browser',
        link: '/browser'
      });
    }

    if (this.context.currentApp.enabledFeatures.cloudCode) {
      coreSubsections.push({
        name: 'Cloud Code',
        link: '/cloud_code'
      });
    }

    if (this.context.currentApp.enabledFeatures.webhooks) {
      coreSubsections.push({
        name: 'Webhooks',
        link: '/webhooks'
      });
    }

    if (this.context.currentApp.enabledFeatures.jobs) {
      coreSubsections.push({
        name: 'Jobs',
        link: '/jobs'
      });
    }

    if (this.context.currentApp.enabledFeatures.logs) {
      coreSubsections.push({
        name: 'Logs',
        link: '/logs'
      });
    }

    if (this.context.currentApp.enabledFeatures.config) {
      coreSubsections.push({
        name: 'Config',
        link: '/config'
      });
    }

    if (this.context.currentApp.enabledFeatures.apiConsole) {
      coreSubsections.push({
        name: 'API Console',
        link: '/api_console'
      });
    }

    if (this.context.currentApp.migration) {
      coreSubsections.push({
        name: 'Migration',
        link: '/migration',
      });
    }
    let pushSubsections = [];

    if (this.context.currentApp.enabledFeatures.push) {
      pushSubsections.push({
        name: 'Activity',
        link: '/push/activity'
      });
    }

    if (this.context.currentApp.enabledFeatures.pushAudiences) {
      pushSubsections.push({
        name: 'Audiences',
        link: '/push/audiences'
      });
    }

    let analyticsSidebarSections = [];

    if (this.context.currentApp.enabledFeatures.analyticsOverview) {
      analyticsSidebarSections.push({
        name: 'Overview',
        link: '/analytics/overview'
      });
    }

    if (this.context.currentApp.enabledFeatures.explorer) {
      analyticsSidebarSections.push({
        name: 'Explorer',
        link: '/analytics/explorer'
      });
    }

    if (this.context.currentApp.enabledFeatures.retention) {
      analyticsSidebarSections.push({
        name: 'Retention',
        link: '/analytics/retention'
      });
    }

    if (this.context.currentApp.enabledFeatures.performance) {
      analyticsSidebarSections.push({
        name: 'Performance',
        link: '/analytics/performance'
      });
    }

    if (this.context.currentApp.enabledFeatures.slowQueryTool) {
      analyticsSidebarSections.push({
        name: 'Slow Queries',
        link: '/analytics/slow_queries'
      });
    }

    let settingsSections = [];

    if (this.context.currentApp.enabledFeatures.generalSettings) {
      settingsSections.push({
        name: 'General',
        link: '/settings/general'
      });
    }

    if (this.context.currentApp.enabledFeatures.keysSettings) {
      settingsSections.push({
        name: 'Security & Keys',
        link: '/settings/keys'
      });
    }

    if (this.context.currentApp.enabledFeatures.usersSettings) {
      settingsSections.push({
        name: 'Users',
        link: '/settings/users'
      })
    }

    if (this.context.currentApp.enabledFeatures.pushSettings) {
      settingsSections.push({
        name: 'Push',
        link: '/settings/push'
      });
    }

    if (this.context.currentApp.enabledFeatures.hostingEmailsSettings) {
      settingsSections.push({
        name: 'Hosting and Emails',
        link: '/settings/hosting'
      });
    }

    let appSidebarSections = []

    if (coreSubsections.length > 0) {
      appSidebarSections.push({
        name: 'Core',
        icon: 'core',
        link: '/browser',
        subsections: coreSubsections,
      });
    }

    if (pushSubsections.length > 0) {
      appSidebarSections.push({
        name: 'Push',
        icon: 'push-outline',
        link: '/push',
        style: {paddingLeft: '16px'},
        subsections: pushSubsections,
      });
    }

    if (analyticsSidebarSections.length > 0) {
      appSidebarSections.push({
        name: 'Analytics',
        icon: 'analytics-outline',
        link: '/analytics',
        subsections: analyticsSidebarSections
      });
    }

    if (settingsSections.length > 0) {
      appSidebarSections.push({
        name: 'App Settings',
        icon: 'gear-solid',
        link: '/settings',
        subsections: settingsSections
      });
    };

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
