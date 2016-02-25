/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountOverview    from './Account/AccountOverview.react';
import AccountView        from './AccountView.react';
import AnalyticsOverview  from './Analytics/Overview/Overview.react';
import ApiConsole         from './Data/ApiConsole/ApiConsole.react';
import AppData            from './AppData.react';
import AppsIndex          from './Apps/AppsIndex.react';
import AppsManager        from 'lib/AppsManager';
import Browser            from './Data/Browser/Browser.react';
import check_gatekeeper   from 'lib/check_gatekeeper';
import CloudCode          from './Data/CloudCode/CloudCode.react';
import Config             from './Data/Config/Config.react';
import Explorer           from './Analytics/Explorer/Explorer.react';
import FourOhFour         from 'components/FourOhFour/FourOhFour.react';
import GeneralSettings    from './Settings/GeneralSettings.react';
import history            from 'dashboard/history';
import HostingSettings    from './Settings/HostingSettings.react';
import Icon               from 'components/Icon/Icon.react';
import JobEdit            from 'dashboard/Data/Jobs/JobEdit.react';
import Jobs               from './Data/Jobs/Jobs.react';
import JobsData           from 'dashboard/Data/Jobs/JobsData.react';
import JobsForm           from 'dashboard/Data/Jobs/JobsForm.react';
import Loader             from 'components/Loader/Loader.react';
import Logs               from './Data/Logs/Logs.react';
import Migration          from './Data/Migration/Migration.react';
import Performance        from './Analytics/Performance/Performance.react';
import PushAudiencesIndex from './Push/PushAudiencesIndex.react';
import PushDetails        from './Push/PushDetails.react';
import PushIndex          from './Push/PushIndex.react';
import PushNew            from './Push/PushNew.react';
import PushSettings       from './Settings/PushSettings.react';
import React              from 'react';
import Retention          from './Analytics/Retention/Retention.react';
import SchemaOverview     from './Data/Browser/SchemaOverview.react';
import SecuritySettings   from './Settings/SecuritySettings.react';
import SettingsData       from './Settings/SettingsData.react';
import SlowQueries        from './Analytics/SlowQueries/SlowQueries.react';
import styles             from 'dashboard/Apps/AppsIndex.scss';
import UsersSettings      from './Settings/UsersSettings.react';
import Webhooks           from './Data/Webhooks/Webhooks.react';
import { AsyncStatus }    from 'lib/Constants';
import { center }         from 'stylesheets/base.scss';
import { get }            from 'lib/AJAX';
import {
  Router,
  Route,
  Redirect
} from 'react-router';

let App = React.createClass({
  render() {
    return this.props.children;
  }
});

let Empty = React.createClass({
  render() {
    return <div>Not yet implemented</div>;
  }
});

const AppsIndexPage = () => (
    <AccountView section='Your Apps'>
      <AppsIndex />
    </AccountView>
  );

const AccountSettingsPage = () => (
    <AccountView section='Account Settings'>
      <AccountOverview />
    </AccountView>
  );

class Dashboard extends React.Component {
  constructor(props) {
    super();

    this.state = {
      configLoadingError: '',
      configLoadingState: AsyncStatus.PROGRESS,
    };
  }

  componentDidMount() {
    let promise = get('/parse-dashboard-config.json');
    promise.then(({ apps }) => {
      apps.forEach(app => {
        if (app.serverURL.startsWith('https://api.parse.com/1')) {
          //api.parse.com doesn't have feature availability endpoint, fortunately we know which features
          //it supports and can hard code them
          app.enabledFeatures = {
            dataBrowser: true,
            cloudCode: true,
            webhooks: false, //webhooks requires removal of heroku link code, then it should work.
            jobs: false, //jobs still goes through rails
            logs: true,
            config: true,
            //Other features would be much harder to add, although push console should just need the hiding
            //of scheduled push related stuff
            pushConsole: false,
            pushIndex: false,
            pushAudiences: false,
            //Analytics is probably gone for good, but maybe someone will come up with something eventually
            analyticsOverview: false,
            explorer: false,
            retention: false,
            performance: false,
            slowQueryTool: false,
            //Settings seems reasonable to add although it will probably require brand-new endpoints
            generalSettings: false,
            keysSettings: false,
            usersSettings: false,
            pushSettings: false,
            hostingEmailsSettings: false,
          }
          AppsManager.addApp(app)
        } else {
          //get(app.serverURL + '/dashboard_features') TODO: un-stub this once the endpoint exists in parse-server, and adjust config loading success handling.
          app.enabledFeatures = {
            dataBrowser: true,
          }
          AppsManager.addApp(app)
        }
      });
      this.setState({ configLoadingState: AsyncStatus.SUCCESS });
    }).fail(error => {
      if (typeof error === 'string') {
        this.setState({ configLoadingError: 'Your parse-dashboard-config.json file contains invalid JSON.' });
      }
      this.setState({ configLoadingState: AsyncStatus.FAILED });
    });
  }

  render() {
    if (this.state.configLoadingState === AsyncStatus.PROGRESS) {
      return <div className={center}><Loader/></div>;
    }

    if (this.state.configLoadingError.length > 0) {
      return <div className={styles.empty}>
        <div className={center}>
          <div className={styles.cloud}>
            <Icon width={110} height={110} name='cloud-surprise' fill='#1e3b4d' />
          </div>
          <div style={{fontSize: '58px', color: '#ffffff'}}>{this.state.configLoadingError}</div>
        </div>
      </div>
    }

    return <Router history={history}>
  <Redirect from='/' to='/apps' />
  <Route path='/' component={App}>
    <Route path='apps' component={AppsIndexPage} />

    <Redirect from='apps/:appId' to='/apps/:appId/browser' />
    <Route path='apps/:appId' component={AppData}>
      <Route path='getting_started' component={Empty} />

      <Route path='browser' component={check_gatekeeper('schema_overview') ? SchemaOverview : Browser} />
      <Route path='browser/:className' component={Browser} />

      <Route path='cloud_code' component={CloudCode} />
      <Route path='cloud_code/*' component={CloudCode} />
      <Route path='webhooks' component={Webhooks} />
      <Redirect from='jobs' to='/apps/:appId/jobs/scheduled' />
      <Route path='jobs' component={JobsData}>
        <Route path='new' component={JobEdit} />
        <Route path='edit/:jobId' component={JobEdit} />
        <Route path=':section' component={Jobs} />
      </Route>
      <Redirect from='logs' to='/apps/:appId/logs/info' />
      <Route path='logs/:type' component={Logs} />
      <Route path='config' component={Config} />
      <Route path='api_console' component={ApiConsole} />
      <Route path='migration' component={Migration} />
      <Redirect from='push' to='/apps/:appId/push/activity/all' />
      <Redirect from='push/activity' to='/apps/:appId/push/activity/all' />
      <Route path='push/activity/:category' component={PushIndex} />
      <Route path='push/audiences' component={PushAudiencesIndex} />
      <Route path='push/new' component={PushNew} />
      <Route path='push/:pushId' component={PushDetails} />

      <Redirect from='analytics' to='/apps/:appId/analytics/overview' />
      <Route path='analytics'>
        <Route path='overview' component={AnalyticsOverview} />
        <Redirect from='explorer' to='/apps/:appId/analytics/explorer/chart' />
        <Route path='explorer/:displayType' component={Explorer} />
        <Route path='retention' component={Retention} />
        <Route path='performance' component={Performance} />
        <Route path='slow_queries' component={SlowQueries} />
      </Route>

      <Redirect from='settings' to='/apps/:appId/settings/general' />
      <Route path='settings' component={SettingsData}>
        <Route path='general' component={GeneralSettings} />
        <Route path='keys' component={SecuritySettings} />
        <Route path='users' component={UsersSettings} />
        <Route path='push' component={PushSettings} />
        <Route path='hosting' component={HostingSettings} />
      </Route>
    </Route>

    <Redirect from='account' to='/account/overview' />
    <Route path='account/overview' component={AccountSettingsPage} />
  </Route>
  <Route path='*' component={FourOhFour} />
    </Router>
  }
}

module.exports = Dashboard;
