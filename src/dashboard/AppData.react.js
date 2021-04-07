/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import AppSelector from 'dashboard/AppSelector.react';
import AppsManager from 'lib/AppsManager';
import history     from 'dashboard/history';

export const AppContext = React.createContext({
  generatePath: null,
  currentApp: null
});

class AppData extends React.Component {
  _appContext = {
    generatePath: this.generatePath,
    currentApp: null
  }

  get currentApp() {
    return AppsManager.findAppBySlugOrName(this.props.params.appId)
  }

  get appContext() {
    if (this.appId !== this.props.params.appId) {
      this.appId = this.props.params.appId
      this._appContext = {
        generatePath: this.generatePath,
        currentApp: this.currentApp
      }
    }
    return this._appContext
  }

  generatePath = (path) => {
    return '/apps/' + this.props.params.appId + '/' + path;
  }

  render() {
    if (this.props.params.appId === '_') {
      return (
      <AppContext.Provider value={this.appContext}>
        <AppSelector />;
      </AppContext.Provider>
      )
    }
    //Find by name to catch edge cases around escaping apostrophes in URLs
    const current = this.currentApp;
    if (current) {
      current.setParseKeys();
    } else {
      history.replace('/apps');
      return <div />;
    }
    return (
      <AppContext.Provider value={this.appContext}>
        <div>
          {this.props.children}
        </div>
      </AppContext.Provider>
    );
  }
}

export default AppData;
