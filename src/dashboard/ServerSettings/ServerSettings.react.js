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

const handleMessage = ({ data }) => {
  // Reloads the page when receives a message with a string "reload"
  if (data === 'reload') {
    window.location.reload();
  }
}

export default class ServerSettings extends DashboardView {
  constructor () {
    super();
    this.section = 'Server Settings';
    this.subsection = 'General';
  }

  componentWillMount() {
    window.addEventListener('message', handleMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message');
  }

  renderContent () {
    const { appId, targetPage } = this.props.params;
    const iframeSrc = targetPage
      ? `${b4aSettings.DASHBOARD_PATH}/classic#/wizard/${targetPage}/${appId}`
      : `${b4aSettings.DASHBOARD_PATH}/apps/settings/${appId}?showCardsOnly=true`

    return (
      <div>
        <div className={styles.content}>
          <iframe src={iframeSrc} className={styles.iframeContent} />
        </div>
        <Toolbar section='Server Settings' />
      </div>
    );
  }
}
