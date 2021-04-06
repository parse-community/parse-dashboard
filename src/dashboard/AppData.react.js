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
  generatePath(path) {
    return '/apps/' + this.props.params.appId + '/' + path;
  }

  render() {
    const appContext = {
      generatePath: this.generatePath.bind(this),
      currentApp: AppsManager.findAppBySlugOrName(this.props.params.appId)
    }
    if (this.props.params.appId === '_') {
      return (
      <AppContext.Provider value={appContext}>
        <AppSelector />;
      </AppContext.Provider>
      )
    }
    //Find by name to catch edge cases around escaping apostrophes in URLs
    const current = AppsManager.findAppBySlugOrName(this.props.params.appId);
    if (current) {
      current.setParseKeys();
    } else {
      history.replace('/apps');
      return <div />;
    }
    return (
      <AppContext.Provider value={appContext}>
        <div>
          {this.props.children}
        </div>
      </AppContext.Provider>
    );
  }
}

export default AppData;
