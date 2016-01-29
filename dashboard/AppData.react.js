import React from 'react';

import AppSelector from 'dashboard/AppSelector.react';
import AppsManager from 'lib/AppsManager';
import history from 'dashboard/history';
import html from 'lib/htmlString';
import ParseApp from 'lib/ParseApp';

let AppData = React.createClass({
  childContextTypes: {
    generatePath: React.PropTypes.func,
    currentApp: React.PropTypes.instanceOf(ParseApp)
  },

  getChildContext() {
    return {
      generatePath: this.generatePath,
      currentApp: AppsManager.findAppBySlug(this.props.params.appId)
    };
  },

  generatePath(path) {
    return '/apps/' + this.props.params.appId + '/' + path;
  },

  render() {
    if (this.props.params.appId === '_') {
      return <AppSelector />;
    }
    let current = AppsManager.findAppBySlug(this.props.params.appId);
    if (current) {
      current.setParseKeys();
    } else {
      history.replaceState(null, '/apps');
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
