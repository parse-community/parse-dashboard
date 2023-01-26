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
import CloudCode          from './Data/CloudCode/CloudCode.react';
import Config             from './Data/Config/Config.react';
import Explorer           from './Analytics/Explorer/Explorer.react';
import FourOhFour         from 'components/FourOhFour/FourOhFour.react';
import GeneralSettings    from './Settings/GeneralSettings.react';
import GraphQLConsole     from './Data/ApiConsole/GraphQLConsole.react';
import HostingSettings    from './Settings/HostingSettings.react';
import Icon               from 'components/Icon/Icon.react';
import JobEdit            from 'dashboard/Data/Jobs/JobEdit.react';
import Jobs               from './Data/Jobs/Jobs.react';
import JobsData           from 'dashboard/Data/Jobs/JobsData.react';
import Loader             from 'components/Loader/Loader.react';
import Logs               from './Data/Logs/Logs.react';
import Migration          from './Data/Migration/Migration.react';
import ParseApp           from 'lib/ParseApp';
import Performance        from './Analytics/Performance/Performance.react';
import PushAudiencesIndex from './Push/PushAudiencesIndex.react';
import PushDetails        from './Push/PushDetails.react';
import PushIndex          from './Push/PushIndex.react';
import PushNew            from './Push/PushNew.react';
import PushSettings       from './Settings/PushSettings.react';
import React              from 'react';
import RestConsole        from './Data/ApiConsole/RestConsole.react';
import Retention          from './Analytics/Retention/Retention.react';
import SchemaOverview     from './Data/Browser/SchemaOverview.react';
import SecuritySettings   from './Settings/SecuritySettings.react';
import SettingsData       from './Settings/SettingsData.react';
import SlowQueries        from './Analytics/SlowQueries/SlowQueries.react';
import styles             from 'dashboard/Apps/AppsIndex.scss';
import UsersSettings      from './Settings/UsersSettings.react';
import Webhooks           from './Data/Webhooks/Webhooks.react';
import { AsyncStatus }    from 'lib/Constants';
import baseStyles         from 'stylesheets/base.scss';
import { get }            from 'lib/AJAX';
import { setBasePath }    from 'lib/AJAX';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Playground from './Data/Playground/Playground.react';

const ShowSchemaOverview = false; //In progress features. Change false to true to work on this feature.

class Empty extends React.Component {
  render() {
    return <div>Not yet implemented</div>;
  }
}

const AccountSettingsPage = () => (
    <AccountView section='Account Settings'>
      <AccountOverview />
    </AccountView>
  );

const PARSE_DOT_COM_SERVER_INFO = {
  features: {
    schemas: {
      addField: true,
      removeField: true,
      addClass: true,
      removeClass: true,
      clearAllDataFromClass: false, //This still goes through ruby
      exportClass: false, //Still goes through ruby
    },
    cloudCode: {
      viewCode: true,
    },
    hooks: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    logs: {
      info: true,
      error: true,
    },
    globalConfig: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    playground: {
      evalCode: true
    }
  },
  parseServerVersion: 'Parse.com',
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super();
    this.state = {
      configLoadingError: '',
      configLoadingState: AsyncStatus.PROGRESS,
      newFeaturesInLatestVersion: [],
    };
    setBasePath(props.path);
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('password');
  }

  componentDidMount() {
    get('/parse-dashboard-config.json').then(({ apps, newFeaturesInLatestVersion = [] }) => {
      this.setState({ newFeaturesInLatestVersion });
      let appInfoPromises = apps.map(app => {
        if (app.serverURL.startsWith('https://api.parse.com/1')) {
          //api.parse.com doesn't have feature availability endpoint, fortunately we know which features
          //it supports and can hard code them
          app.serverInfo = PARSE_DOT_COM_SERVER_INFO;
          return Promise.resolve(app);
        } else {
          app.serverInfo = {}
          return new ParseApp(app).apiRequest(
            'GET',
            'serverInfo',
            {},
            { useMasterKey: true }
          ).then(serverInfo => {
            app.serverInfo = serverInfo;
            return app;
          }, error => {
            if (error.code === 100) {
              app.serverInfo = {
                error: 'unable to connect to server',
                features: {},
                parseServerVersion: 'unknown'
              }
              return Promise.resolve(app);
            } else if (error.code === 107) {
              app.serverInfo = {
                error: 'server version too low',
                features: {},
                parseServerVersion: 'unknown'
              }
              return Promise.resolve(app);
            } else {
              app.serverInfo = {
                error: error.message || 'unknown error',
                features: {},
                parseServerVersion: 'unknown'
              }
              return Promise.resolve(app);
            }
          });
        }
      });
      return Promise.all(appInfoPromises);
    }).then(function(resolvedApps) {
      resolvedApps.forEach(app => {
        AppsManager.addApp(app);
      });
      this.setState({ configLoadingState: AsyncStatus.SUCCESS });
    }.bind(this)).catch(({ error }) => {
      this.setState({
        configLoadingError: error,
        configLoadingState: AsyncStatus.FAILED
      });
    });
  }

  render() {
    if (this.state.configLoadingState === AsyncStatus.PROGRESS) {
      return <div className={baseStyles.center}><Loader/></div>;
    }

    if (this.state.configLoadingError && this.state.configLoadingError.length > 0) {
      return <div className={styles.empty}>
        <div className={baseStyles.center}>
          <div className={styles.cloud}>
            <Icon width={110} height={110} name='cloud-surprise' fill='#1e3b4d' />
          </div>
          {/* use non-breaking hyphen for the error message to keep the filename on one line */}
          <div className={styles.loadingError}>{this.state.configLoadingError.replace(/-/g, '\u2011')}</div>
        </div>
      </div>
    }

    const AppsIndexPage = () => (
      <AccountView section='Your Apps'>
        <AppsIndex newFeaturesInLatestVersion={this.state.newFeaturesInLatestVersion}/>
      </AccountView>
    );

    const SettingsRoute = (
      <Route element={<SettingsData />}>
        <Route path='general' element={<GeneralSettings />} />
        <Route path='keys' element={<SecuritySettings />} />
        <Route path='users' element={<UsersSettings />} />
        <Route path='push' element={<PushSettings />} />
        <Route path='hosting' element={<HostingSettings />} />
        <Route index element={<Navigate replace to='general' />} />
      </Route>
    )

    const JobsRoute = (
      <Route element={<JobsData />}>
        <Route path='new' element={<JobEdit />} />
        <Route path='edit/:jobId' element={<JobEdit />} />
        <Route path=':section' element={<Jobs />} />
        <Route index element={<Navigate replace to='all' />} />
      </Route>
    )

    const AnalyticsRoute = (
      <Route>
        <Route path='overview' element={<AnalyticsOverview />} />
        <Route path='explorer/:displayType' element={<Explorer />} />
        <Route path='retention' element={<Retention />} />
        <Route path='performance' element={<Performance />} />
        <Route path='slow_queries' element={<SlowQueries />} />
        <Route index element={<Navigate replace to='overview' />} />
        <Route path='explorer' element={<Navigate replace to='chart' />} />
      </Route>
    )

    const BrowserRoute = ShowSchemaOverview ? SchemaOverview : Browser;

    const ApiConsoleRoute = (
      <Route element={<ApiConsole />}>
        <Route path='rest' element={<RestConsole />} />
        <Route path='graphql' element={<GraphQLConsole />} />
        <Route path='js_console' element={<Playground />} />
        <Route index element={<Navigate replace to='rest' />} />
      </Route>
    )

    const AppRoute = (
      <Route element={<AppData />}>
        <Route index element={<Navigate replace to='browser' />} />

        <Route path='getting_started' element={<Empty />} />

        <Route path='browser/:className/:entityId/:relationName' element={<BrowserRoute />} />
        <Route path='browser/:className' element={<BrowserRoute />} />
        <Route path='browser' element={<BrowserRoute />} />

        <Route path='cloud_code' element={<CloudCode />} />
        <Route path='cloud_code/*' element={<CloudCode />} />
        <Route path='webhooks' element={<Webhooks />} />

        <Route path='jobs'>
          {JobsRoute}
        </Route>

        <Route path='logs/:type' element={<Logs />} />
        <Route path='logs' element={<Navigate replace to='info' />} />

        <Route path='config' element={<Config />} />

        <Route path='api_console'>
          {ApiConsoleRoute}
        </Route>

        <Route path='migration' element={<Migration />} />

        <Route path='push' element={<Navigate replace to='new' />} />
        <Route path='push/activity' element={<Navigate replace to='all' />} />

        <Route path='push/activity/:category' element={<PushIndex />} />
        <Route path='push/audiences' element={<PushAudiencesIndex />} />
        <Route path='push/new' element={<PushNew />} />
        <Route path='push/:pushId' element={<PushDetails />} />

        {/* Unused routes... */}
        <Route path='analytics'>
          {AnalyticsRoute}
        </Route>

        <Route path='settings'>
          {SettingsRoute}
        </Route>
      </Route>
    )

    const Index = (
      <Route>
        <Route index element={<AppsIndexPage />} />
        <Route path=':appId'>
          {AppRoute}
        </Route>
      </Route>
    )

    return (
      <BrowserRouter basename={window.PARSE_DASHBOARD_PATH || '/'}>
        <Helmet>
          <title>Parse Dashboard</title>
        </Helmet>
        <Routes>
          <Route path='/apps'>
            {Index}
          </Route>
          <Route path='account/overview' element={<AccountSettingsPage />} />
          <Route path='account' element={<Navigate replace to='overview' />} />
          <Route index element={<Navigate replace to='/apps' />} />
          <Route path='*' element={<FourOhFour />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
