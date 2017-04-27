/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CategoryList  from 'components/CategoryList/CategoryList.react';
import DashboardView from 'dashboard/DashboardView.react';
import EmptyState    from 'components/EmptyState/EmptyState.react';
import LogView       from 'components/LogView/LogView.react';
import LogViewEntry  from 'components/LogView/LogViewEntry.react';
import React         from 'react';
import ReleaseInfo   from 'components/ReleaseInfo/ReleaseInfo';
import Toolbar       from 'components/Toolbar/Toolbar.react';

import styles        from 'dashboard/Data/Logs/Logs.scss';

let subsections = {
  info: 'Info',
  error: 'Error'
};

export default class Logs extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Logs';

    this.state = {
      logs: undefined,
      release: undefined
    };
  }

  componentDidMount() {
    this.fetchLogs(this.context.currentApp, this.props.params.type);
    // this.fetchRelease(this.context.currentApp);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.fetchLogs(nextContext.currentApp, nextProps.params.type);
      // this.fetchRelease(nextContext.currentApp);
    }
  }

  fetchLogs(app, type) {
    let typeParam = (type || 'INFO').toUpperCase();
    app.getLogs(typeParam).then(
      (logs) => this.setState({ logs }),
      () => this.setState({ logs: [] })
    );
  }

  // As parse-server doesn't support (yet?) versioning, we are disabling
  // this call in the meantime.

  /*
  fetchRelease(app) {
    app.getLatestRelease().then(
      ({ release }) => this.setState({ release }),
      () => this.setState({ release: null })
    );
  }
  */

  renderSidebar() {
    let current = this.props.params.type || '';
    return (
      <CategoryList current={current} linkPrefix={'logs/'} categories={[
        { name: 'Info', id: 'info' },
        { name: 'Error', id: 'error' }
      ]} />
    );
  }

  renderContent() {
    let toolbar = null;
    if (subsections[this.props.params.type]) {
      toolbar = (
        <Toolbar
          section='Logs'
          subsection={subsections[this.props.params.type]}
          details={ReleaseInfo({ release: this.state.release })}>
        </Toolbar>
      );
    }
    let content = null;
    if (this.state.logs === undefined) {
      // loading
    } else if (this.state.logs.length === 0) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            icon='files-outline'
            title='No logs in the last 30 days'
            description='When you start using Cloud Code, your logs will show up here.'
            cta='Learn more'
            action={() => window.location = 'http://docs.parseplatform.org/cloudcode/guide'} />
        </div>
      );
    } else {
      content = (
        <div className={styles.content}>
          <LogView>
            {this.state.logs.map(({ message, timestamp }) => <LogViewEntry
              key={timestamp}
              text={message}
              timestamp={timestamp} />)}
          </LogView>
        </div>
      );
    }
    return (
      <div className={styles.logs}>
        {content}
        {toolbar}
      </div>
    );
  }
}
