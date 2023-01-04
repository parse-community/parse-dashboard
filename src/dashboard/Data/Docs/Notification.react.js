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
    super();

    this.state = {
      lastNote: props.note,
      isErrorNote: props.isErrorNote,
      hiding: false,
    };

    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.lastNote !== nextProps.note) {
      clearTimeout(this.timeout);
      if (this.state.hiding) {
        this.setState({ lastNote: nextProps.note, isErrorNote: nextProps.isErrorNote, hiding: false })
      } else {
        this.setState({ lastNote: nextProps.note, isErrorNote: nextProps.isErrorNote });
      }
    }
    if (!nextProps.note) {
      return;
    }
    this.timeout = setTimeout(() => {
      this.setState({ hiding: true });
      this.timeout = setTimeout(() => {
        this.setState({ lastNote: null });
      }, 190);
    }, 3000);
  }

  render() {
    if (!this.state.lastNote) {
      return null;
    }

    let bottomRight = new Position(window.innerWidth, window.innerHeight);
    let classes = [];

    if (this.state.isErrorNote) {
      classes.push(styles.notificationError);
    } else {
      classes.push(styles.notificationMessage);
    }

    if (this.state.hiding) {
      classes.push(styles.notificationHide);
    }
    return (
      <Popover fixed={true} position={bottomRight}>
        <div className={classes.join(' ')}>{this.state.lastNote}</div>
      </Popover>
    );
  }
}
