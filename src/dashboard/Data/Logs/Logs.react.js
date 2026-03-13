/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import CategoryList from 'components/CategoryList/CategoryList.react';
import DashboardView from 'dashboard/DashboardView.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import LogView from 'components/LogView/LogView.react';
import LogViewEntry from 'components/LogView/LogViewEntry.react';
import React from 'react';
import ReleaseInfo from 'components/ReleaseInfo/ReleaseInfo';
import Toolbar from 'components/Toolbar/Toolbar.react';

import styles from 'dashboard/Data/Logs/Logs.scss';
import { withRouter } from 'lib/withRouter';

const subsections = {
  info: 'Info',
  error: 'Error',
};

@withRouter
class Logs extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Logs';

    this.state = {
      logs: undefined,
      release: undefined,
      loading: false,
      hasMore: false,
    };
  }

  componentDidMount() {
    this.fetchLogs(this.context, this.props.params.type);
    // this.fetchRelease(this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.params.type !== nextProps.params.type) {
      this.fetchLogs(nextContext, nextProps.params.type);
      // this.fetchRelease(nextContext);
    }
  }

  fetchLogs(app, type, until) {
    const PAGE_SIZE = 100;
    const typeParam = (type || 'INFO').toUpperCase();
    const options = { size: PAGE_SIZE };
    if (until) {
      options.until = until;
    }
    this.setState({ loading: true });
    app.getLogs(typeParam, options).then(
      newLogs => {
        this.setState(prevState => ({
          logs: until && Array.isArray(prevState.logs)
            ? prevState.logs.concat(newLogs)
            : newLogs,
          hasMore: newLogs.length >= PAGE_SIZE,
          loading: false,
        }));
      },
      () => this.setState(prevState => ({
        logs: prevState.logs || [],
        hasMore: false,
        loading: false,
      }))
    );
  }

  handleLoadMore() {
    const logs = this.state.logs;
    if (!logs || logs.length === 0) {
      return;
    }
    const oldestLog = logs[logs.length - 1];
    const oldestTimestamp = oldestLog.timestamp.iso || oldestLog.timestamp;
    this.fetchLogs(this.context, this.props.params.type, oldestTimestamp);
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
    const current = this.props.params.type || '';
    return (
      <CategoryList
        current={current}
        linkPrefix={'logs/'}
        categories={[
          { name: 'Info', id: 'info' },
          { name: 'Error', id: 'error' },
        ]}
      />
    );
  }

  renderContent() {
    let toolbar = null;
    if (subsections[this.props.params.type]) {
      toolbar = (
        <Toolbar
          section="Logs"
          subsection={subsections[this.props.params.type]}
          details={ReleaseInfo({ release: this.state.release })}
        ></Toolbar>
      );
    }
    let content = null;
    if (!Array.isArray(this.state.logs)) {
      // loading
    } else if (this.state.logs.length === 0) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            icon="files-outline"
            title="No logs in the last 30 days"
            description="When you start using Cloud Code, your logs will show up here."
            cta="Learn more"
            action={() => (window.location = 'http://docs.parseplatform.org/cloudcode/guide')}
          />
        </div>
      );
    } else {
      content = (
        <div className={styles.content}>
          <LogView>
            {this.state.logs.map(({ message, timestamp }) => (
              <LogViewEntry key={timestamp} text={message} timestamp={timestamp} />
            ))}
          </LogView>
          {this.state.hasMore && (
            <div className={styles.showMore}>
              <Button
                progress={this.state.loading}
                color="blue"
                value="Load more logs"
                onClick={() => this.handleLoadMore()}
              />
            </div>
          )}
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

export default Logs;
