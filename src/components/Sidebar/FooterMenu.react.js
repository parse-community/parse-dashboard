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
    pos.x += 9;
    pos.y -= 12;
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
            {this.props.children}
          </div>
        </Popover>
      );
    }
    return (
      <a onClick={this.toggle.bind(this)} ref='more' className={styles.more}>
        <Icon height={18} width={18} name='ellipses' />
        {content}
      </a>
    );
  }
}
