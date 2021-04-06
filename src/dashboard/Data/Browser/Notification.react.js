/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Popover  from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import React    from 'react';
import styles   from 'dashboard/Data/Browser/Browser.scss';

export default class Notification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hiding: false,
      hidden: false
    };

    this.timeout = null;
  }

  static getDerivedStateFromProps() {
    return { hiding: false, hidden: false }
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ hiding: true });
      this.timeout = setTimeout(() => {
        this.setState({ hiding: false, hidden: true });
      }, 190);
    }, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    if (this.state.hidden) {
      return null;
    }

    let bottomRight = new Position(window.innerWidth, window.innerHeight);
    let classes = [];

    if (this.props.isErrorNote) {
      classes.push(styles.notificationError);
    } else {
      classes.push(styles.notificationMessage);
    }

    if (this.state.hiding) {
      classes.push(styles.notificationHide);
    }
    return (
      <Popover fixed={true} position={bottomRight}>
        <div className={classes.join(' ')}>{this.props.note}</div>
      </Popover>
    );
  }
}
