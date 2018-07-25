/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 */
import DashboardView from 'dashboard/DashboardView.react';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from 'dashboard/ServerSettings/ServerSettings.scss'

export default class ServerSettings extends DashboardView {

  constructor (props) {
    super();
    this.section = 'Server Settings';
    this.subsection = 'General';

    console.log('props', props);

    this.state = {
      appId: props && props.params && props.params.appId
    };
  }

  renderContent () {
    let toolbar = (
      <Toolbar
        section='Server Settings'>
      </Toolbar>
    );
    let content = (
      this.state.appId ?
        <div className={styles.content}>
          <iframe src={`${b4aSettings.DASHBOARD_PATH}/apps/settings/${this.state.appId}?showCardsOnly=true`} className={styles.iframeContent}>
          </iframe>
        </div> :
        <div>Loading ...</div>
    );

    return (
      <div>
        {content}
        {toolbar}
      </div>
    );
  }
}
