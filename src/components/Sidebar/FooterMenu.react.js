/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon     from 'components/Icon/Icon.react';
import Popover  from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import React    from 'react';
import styles   from 'components/Sidebar/Sidebar.scss';

let mountPath = window.PARSE_DASHBOARD_PATH;

export default class FooterMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      show: false,
      position: null,
    };
  }

  toggle() {
    let pos = Position.inWindow(this.refs.more);
    pos.x += 24;
    this.setState({
      show: true,
      position: pos
    });
  }

  render() {
    let content = null;
    if (this.state.show) {
      content = (
        <Popover
          fixed={true}
          position={this.state.position}
          onExternalClick={() => this.setState({ show: false })}>
          <div className={styles.popup}>
            <a href={`${mountPath}logout`}>Log Out <span className={styles.emoji}>👋</span></a>
            <a target='_blank' href='http://docs.parseplatform.org/parse-server/guide/'>Server Guide <span className={styles.emoji}>📚</span></a>
            <a target='_blank' href='http://stackoverflow.com/questions/tagged/parse.com'>Code-level Questions <span className={styles.emoji}>❓</span></a>
            <a target='_blank' href='http://stackoverflow.com/questions/tagged/parse-server'>Server Questions <span className={styles.emoji}>❓</span></a>
            <a target='_blank' href='http://serverfault.com/tags/parse'>Deployment/Maintenance <span className={styles.emoji}>⚡️</span></a>
          </div>
        </Popover>
      );
    }
    return (
      <a onClick={this.toggle.bind(this)} ref='more' className={styles.more}>
        <Icon height={24} width={24} name='ellipses' />
        {content}
      </a>
    );
  }
}
