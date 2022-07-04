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
    this.moreRef = React.createRef();
  }

  toggle() {
    let pos = Position.inWindow(this.moreRef.current);
    pos.x += 95;
    this.setState({
      show: true,
      position: pos
    });
  }

  render() {
    if (this.props.isCollapsed) {
      return (
        <div className={styles.more}>
          <Icon height={24} width={24} name='ellipses' />
        </div>
      );
    }

    let content = null;
    if (this.state.show) {
      content = (
        <Popover
          fixed={true}
          position={this.state.position}
          onExternalClick={() => this.setState({ show: false })}>
          <div className={styles.popup}>
            <a href={`${mountPath}logout`}>➡️ Log out</a>
          </div>
        </Popover>
      );
    }
    return (
      <a onClick={this.toggle.bind(this)} ref={this.moreRef} className={styles.more}>
        <Icon height={24} width={24} name='ellipses' />
        {content}
      </a>
    );
  }
}
