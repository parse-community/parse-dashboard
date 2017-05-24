/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React       from 'react';

import AppSelector from 'dashboard/AppSelector.react';
import AppsManager from 'lib/AppsManager';
import history     from 'dashboard/history';
import ParseApp    from 'lib/ParseApp';

let AppData = React.createClass({
  childContextTypes: {
    generatePath: React.PropTypes.func,
    currentApp: React.PropTypes.instanceOf(ParseApp)
  },

  getChildContext() {
    return {
      generatePath: this.generatePath,
      currentApp: AppsManager.findAppBySlugOrName(this.props.params.appId)
    };
  },

  generatePath(path) {
    return '/apps/' + this.props.params.appId + '/' + path;
  },

  render() {
    if (this.props.params.appId === '_') {
      return <AppSelector />;
    }
    //Find by name to catch edge cases around escaping apostrophes in URLs
    let current = AppsManager.findAppBySlugOrName(this.props.params.appId);
    if (current) {
      current.setParseKeys();
    } else {
      history.replace('/apps');
      return <div />;
    }
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

module.exports = AppData;
