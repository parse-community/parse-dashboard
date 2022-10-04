/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Calendar       from 'components/Calendar/Calendar.react';
import { Directions } from 'lib/Constants';
import Icon           from 'components/Icon/Icon.react';
import {
  monthDayStringUTC
}                     from 'lib/DateUtils';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import styles         from 'components/ChromeDatePicker/ChromeDatePicker.scss';

export default class ChromeDatePicker extends React.Component {
  constructor() {
    super();

    this.state = {
      open: false,
      position: null,
    };

    this.wrapRef = React.createRef()
  }

  toggle() {
    this.setState(() => {
      if (this.state.open) {
        return { open: false };
      }
      let pos = Position.inWindow(this.wrapRef.current);
      if (this.props.align === Directions.RIGHT) {
        pos.x += this.wrapRef.current.clientWidth;
      }
      return {
        open: true,
        position: pos
      };
    });
  }

  onChange(value) {
    this.props.onChange(value);
    this.setState({ open: false });
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    let popover = null;
    let content = null;
    if (this.state.open) {
      let classes = [styles.open];
      if (this.props.align === Directions.RIGHT) {
        classes.push(styles.right);
      }
      popover = (
        <Popover fixed={true} position={this.state.position} onExternalClick={this.close.bind(this)}>
          <div className={classes.join(' ')}>
            <div className={styles.calendar}>
              <Calendar
                value={this.props.value}
                onChange={this.onChange.bind(this)} />
            </div>
            <div className={styles.chrome} onClick={this.close.bind(this)}>
              <span>{`${monthDayStringUTC(this.props.value)}`}</span>
              <Icon width={18} height={18} name='calendar-solid' fill='#169CEE' />
            </div>
          </div>
        </Popover>
      );
    } else {
      content = (
        <div className={styles.chrome}>
          <span>{`${monthDayStringUTC(this.props.value)}`}</span>
          <Icon width={18} height={18} name='calendar-solid' fill='#169CEE' />
        </div>
      );
    }

    return (
      <div className={styles.wrap} onClick={this.toggle.bind(this)} ref={this.wrapRef}>
        {content}
        {popover}
      </div>
    );
  }
}

ChromeDatePicker.propTypes = {
  value: PropTypes.object.describe(
    'The Date value of the picker.'
  ),
  onChange: PropTypes.func.describe(
    'A function called when the date picker is changed. It receives a new Date value.'
  ),
};
