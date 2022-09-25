/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CodeSnippet   from 'components/CodeSnippet/CodeSnippet.react';
import DashboardView from 'dashboard/DashboardView.react';
import EmptyState    from 'components/EmptyState/EmptyState.react';
import FileTree      from 'components/FileTree/FileTree.react';
import React         from 'react';
import styles        from 'dashboard/Data/CloudCode/CloudCode.scss';
import Toolbar       from 'components/Toolbar/Toolbar.react';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';

function getPath(params) {
  return params.splat;
}

@withRouter
class CloudCode extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Cloud Code';

    this.state = {
      files: undefined,
      source: undefined
    };
  }

  componentWillMount() {
    this.fetchSource(this.context, getPath(this.props.params));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.fetchSource(nextContext, getPath(nextProps.params));
    }
  }

  fetchSource(app, fileName) {
    app.getLatestRelease().then(
      (release) => {
        this.setState({ files: release.files, source: undefined });

        if (!release.files || Object.keys(release.files).length === 0) {
          // Releases is empty. Show EmptyState
          return;
        }

        if (!fileName || release.files[fileName] === undefined) {
          // Means we're still in /cloud_code/. Let's redirect to /cloud_code/main.js
          this.props.navigate(generatePath(this.context, 'cloud_code/main.js'), { replace: true });
        } else {
          // Means we can load /cloud_code/<fileName>
          app.getSource(fileName).then(
            (source) => this.setState({ source: source }),
            () => this.setState({ source: undefined })
          );
        }
      },
      () => this.setState({ files: undefined, source: undefined })
    );
  }

  renderSidebar() {
    let current = getPath(this.props.params) || '';
    let files = this.state.files;
    if (!files) {
      return null;
    }
    let paths = [];
    for (let key in files) {
      paths.push(key);
    }
    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ borderLeft: '1px solid #3e87b2' }}>
          <FileTree
            linkPrefix={generatePath(this.context, 'cloud_code/')}
            current={current}
            files={paths} />
        </div>
      </div>
    );
  }

  renderContent() {
    let toolbar = null;
    let content = null;
    let fileName = getPath(this.props.params);

    if (!this.state.files || Object.keys(this.state.files).length === 0) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            title={'You haven\u2019t deployed any code yet.'}
            icon='folder-outline'
            description={'When you deploy your cloud code, you\u2019ll be able to see your files here'}
            cta='Get started with Cloud Code'
            action={() => window.location = 'http://docs.parseplatform.org/cloudcode/guide'} />
        </div>
      );
    } else {
      if (fileName) {
        toolbar = <Toolbar
          section='Cloud Code'
          subsection={fileName} />;

        let source = this.state.files[fileName];
        if (source && source.source) {
          content = (
            <div className={styles.content}>
              <CodeSnippet source={source.source} language='javascript' />
            </div>
          );
        }
      }
    }

    return (
      <div className={styles.source}>
        {content}
        {toolbar}
      </div>
    );
  }
}

export default CloudCode;
