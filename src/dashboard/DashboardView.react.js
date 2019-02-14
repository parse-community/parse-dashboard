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
import styles        from 'dashboard/Dashboard.scss';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import AccountManager from 'lib/AccountManager';
import { post } from 'lib/AJAX';

// Alert parameters
const MySwal = withReactContent(Swal)
const mobileCompatibilityAlert = {
  title: '<span style="font-size: 2.25rem">Mobile Advice</span>',
  html: '<span style="font-size: 2.25rem">For a better experience, we recommend using Parse Dashboard on large screen devices, such as desktops or tablets</span>',
  type: 'info',
  confirmButtonColor: '#208aec',
  confirmButtonText: '<span style="font-size: 2.25rem">Understood</span>'
};

// Hides the zendesk button as soon as possible
const hideZendesk = () => {
  if (typeof zE !== 'undefined' && typeof zE.hide === 'function') {
    zE.hide();
  } else{
    setTimeout(hideZendesk, 50);
  }
};
hideZendesk();

// Checks if the current device is mobile
// See: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
const isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

export default class DashboardView extends React.Component {

  componentDidMount() {
    const user = AccountManager.currentUser();
    // Current window size is lesser than Bootstrap's medium size
    if (user && !user.mobileAlertShown && isMobile()) {
      user.mobileAlertShown = true;
      MySwal.fire(mobileCompatibilityAlert);
      AccountManager.setCurrentUser({ user });
      post(`/b4aUser/parseDashboardMobileAlertShown`);
    }
  }

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

    let features = this.context.currentApp.serverInfo.features;

    const { showAdminPage } = this.context.currentApp.custom

    let coreSubsections = [];
    if (features.schemas &&
      features.schemas.addField &&
      features.schemas.removeField &&
      features.schemas.addClass &&
      features.schemas.removeClass) {
      coreSubsections.push({
        name: 'Database Browser',
        link: '/browser'
      });
    }

    // Show cloud code to all parse versions
    //if (features.cloudCode && features.cloudCode.viewCode) {
      coreSubsections.push({
        name: 'Cloud Code Functions',
        link: '/cloud_code'
      });
    //}

    //webhooks requires removal of heroku link code, then it should work.
    if (features.hooks && features.hooks.create && features.hooks.read && features.hooks.update && features.hooks.delete) {
      coreSubsections.push({
        name: 'Webhooks',
        link: '/webhooks'
      });
    }

    if (features.cloudCode && features.cloudCode.jobs) {
      coreSubsections.push({
        name: 'Jobs',
        link: '/jobs'
      });
    }

    if (features.logs && Object.keys(features.logs).some(key => features.logs[key])) {
      coreSubsections.push({
        name: 'Logs',
        link: '/logs'
      });
    }

    if (features.globalConfig &&
      features.globalConfig.create &&
      features.globalConfig.read &&
      features.globalConfig.update &&
      features.globalConfig.delete) {
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

    if (features.push && features.push.immediatePush) {
      pushSubsections.push({
        name: 'Send New Push',
        link: '/push/new'
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

    if (features.analytics && features.analytics.overviewAnalysis) {
      analyticsSidebarSections.push({
        name: 'Overview',
        link: '/analytics/overview'
      });
    }

    if (features.analytics && features.analytics.explorerAnalysis) {
      analyticsSidebarSections.push({
        name: 'Explorer',
        link: '/analytics/explorer'
      });
    }

    //These ones might, but require some endpoints to added to Parse Server
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
        name: 'Slow Requests',
        link: '/analytics/slow_requests'
      });
    }

    let settingsSections = [];

    // Settings - nothing remotely like this in parse-server yet. Maybe it will arrive soon.

    //if (features.generalSettings) {
      settingsSections.push({
        name: 'General',
        link: '/settings/general'
      });
    //}
    // if (features.keysSettings) {
      settingsSections.push({
        name: 'Security & Keys',
        link: '/settings/keys'
      });
    // }
    /*
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
        name: 'API Reference',
        icon: 'api-reference',
        link: `${b4aSettings.DASHBOARD_PATH}/apidocs/${this.context.currentApp.applicationId}`,
      });
      appSidebarSections.push({
        name: 'Core',
        icon: 'core',
        link: '/browser',
        subsections: coreSubsections,
      });
    }

    if (showAdminPage) {
      appSidebarSections.push({
        name: 'Admin App',
        icon: 'admin-app',
        link: '/admin',
        badgeParams: {
          label: 'new',
          color: 'green'
        }
      })
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

    appSidebarSections.push({
      name: 'Server Settings',
      icon: 'server-settings-icon',
      link: '/server-settings',
    });

    if (settingsSections.length > 0) {
      appSidebarSections.push({
        name: 'App Settings',
        icon: 'gear-solid',
        link: '/settings',
        subsections: settingsSections
      });
    }

    let sidebar = (
    <Sidebar
      sections={appSidebarSections}
      appSelector={true}
      section={this.section}
      subsection={this.subsection}
      prefix={'/apps/' + appSlug}
      action={this.action}
      primaryBackgroundColor={this.context.currentApp.primaryBackgroundColor}
      secondaryBackgroundColor={this.context.currentApp.secondaryBackgroundColor}
      footerMenuButtons={this.getFooterMenuButtons && this.getFooterMenuButtons()}
      >
      {sidebarChildren}
    </Sidebar>);

    return (
      <div className={styles.dashboard}>
        <div className={styles.content}>
          {this.renderContent()}
        </div>
        {sidebar}
      </div>
    );
  }
}

DashboardView.contextTypes = {
  generatePath: React.PropTypes.func,
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
