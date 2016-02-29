/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp      from 'lib/ParseApp';
import React         from 'react';
import Sidebar       from 'components/Sidebar/Sidebar.react';
import SidebarToggle from 'components/Sidebar/SidebarToggle.react';
import styles        from 'dashboard/Dashboard.scss';

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

    let features = this.context.currentApp.enabledFeatures;

    let anyTruthyKeys = object => typeof object == 'object' && Object.keys(object).some(key => object[key]);

    let coreSubsections = [];
    if (anyTruthyKeys(features.schemas)) {
      coreSubsections.push({
        name: 'Browser',
        link: '/browser'
      });
    }

    if (anyTruthyKeys(features.cloudCode)) {
      coreSubsections.push({
        name: 'Cloud Code',
        link: '/cloud_code'
      });
    }

    if (anyTruthyKeys(features.webhooks)) {
      coreSubsections.push({
        name: 'Webhooks',
        link: '/webhooks'
      });
    }

    if (anyTruthyKeys(features.jobs)) {
      coreSubsections.push({
        name: 'Jobs',
        link: '/jobs'
      });
    }

    if (anyTruthyKeys(features.logs)) {
      coreSubsections.push({
        name: 'Logs',
        link: '/logs'
      });
    }

    if (anyTruthyKeys(features.config)) {
      coreSubsections.push({
        name: 'Config',
        link: '/config'
      });
    }

    coreSubsections.push({
      name: 'API Console',
      link: '/api_console'
    });

    if (this.context.currentApp.migration) {
      coreSubsections.push({
        name: 'Migration',
        link: '/migration',
      });
    }
    let pushSubsections = [];

    // The current UI requires instant and scheduled push (and other stuff)
    if (features.push && features.push.instantPush && features.push.scheduledPush) {
      pushSubsections({
        name: 'Send New Push',
        link: '/push/activity'
      });
    }

    if (features.push && features.push.storedPushData) {
      pushSubsections.push({
        name: 'Past Pushes',
        link: '/push/activity'
      });
    }

    if (features.push && features.push.pushAudiences) {
      pushSubsections.push({
        name: 'Audiences',
        link: '/push/audiences'
      });
    }

    let analyticsSidebarSections = [];

    //These analytics pages may never make it into parse server
    /*
    if (features.analyticsOverview) {
      analyticsSidebarSections.push({
        name: 'Overview',
        link: '/analytics/overview'
      });
    }

    if (features.explorer) {
      analyticsSidebarSections.push({
        name: 'Explorer',
        link: '/analytics/explorer'
      });
    }*/

    //These ones might
    if (features.analytics && features.analytics.retentionAnalysis) {
      analyticsSidebarSections.push({
        name: 'Retention',
        link: '/analytics/retention'
      });
    }

    if (features.analytics && features.analytics.performanceAnalysis) {
      analyticsSidebarSections.push({
        name: 'Performance',
        link: '/analytics/performance'
      });
    }

    if (features.analytics && features.analytics.slowQueries) {
      analyticsSidebarSections.push({
        name: 'Slow Queries',
        link: '/analytics/slow_queries'
      });
    }

    let settingsSections = [];

    // Settings - nothing remotely like this in parse-server yet.
    /*
    if (features.generalSettings) {
      settingsSections.push({
        name: 'General',
        link: '/settings/general'
      });
    }

    if (features.keysSettings) {
      settingsSections.push({
        name: 'Security & Keys',
        link: '/settings/keys'
      });
    }

    if (features.usersSettings) {
      settingsSections.push({
        name: 'Users',
        link: '/settings/users'
      })
    }

    if (features.pushSettings) {
      settingsSections.push({
        name: 'Push',
        link: '/settings/push'
      });
    }

    if (features.hostingEmailsSettings) {
      settingsSections.push({
        name: 'Hosting and Emails',
        link: '/settings/hosting'
      });
    }*/

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
