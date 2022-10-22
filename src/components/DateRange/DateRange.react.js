/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Calendar                         from 'components/Calendar/Calendar.react';
import { Directions }                   from 'lib/Constants';
import Icon                             from 'components/Icon/Icon.react';
import {
  monthDayStringUTC,
  monthsFrom,
  daysFrom
}                                       from 'lib/DateUtils';
import Popover                          from 'components/Popover/Popover.react';
import Position                         from 'lib/Position';
import PropTypes                        from 'lib/PropTypes';
import React                            from 'react';
import styles                           from 'components/DateRange/DateRange.scss';

export default class DateRange extends React.Component {
  constructor(props) {
    super();

    let val = props.value || {};

    this.state = {
      open: false,
      position: null,
      start: val.start || monthsFrom(new Date(), -1),
      end: val.end || new Date()
    };

    this.wrapRef = React.createRef();
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

  setStart(start) {
    let end = this.state.end;
    if (start > end) {
      end = daysFrom(start, 1);
    }
    this.setState({ start, end });
  }

  setEnd(end) {
    let start = this.state.start;
    if (start > end) {
      start = daysFrom(end, -1);
    }
    this.setState({ start, end });
  }

  close() {
    this.setState({
      open: false
    });
    this.props.onChange({ start: this.state.start, end: this.state.end });
  }

  rangeString() {
    return (
      `${monthDayStringUTC(this.state.start)} - ${monthDayStringUTC(this.state.end)}`
    );
  }

  render() {
    let popover = null;
    let content = null;
    if (this.state.open) {
      let classes = [styles.open];
      if (this.props.align === Directions.RIGHT) {
        classes.push(styles.right);
      }
      let renderShade = (
        this.state.start.getFullYear() < this.state.end.getFullYear() ||
        this.state.start.getMonth() !== this.state.end.getMonth()
      );
      popover = (
        <Popover fixed={true} position={this.state.position} onExternalClick={this.close.bind(this)}>
          <div className={classes.join(' ')}>
            <div className={styles.calendars}>
              <Calendar
                value={this.state.start}
                onChange={(start) => this.setStart(start)}
                shadeAfter={renderShade} />
              <Calendar
                value={this.state.end}
                onChange={(end) => this.setEnd(end)}
                shadeBefore={renderShade} />
            </div>
            <div className={styles.range} onClick={this.close.bind(this)}>
              <span>{this.rangeString()}</span>
              <Icon width={18} height={18} name='calendar-solid' fill='#169CEE' />
            </div>
          </div>
        </Popover>
      );
    } else {
      content = (
        <div className={styles.range}>
          <span>{this.rangeString()}</span>
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

DateRange.propTypes = {
  value: PropTypes.object.describe(
    'The value of the range. It has two props, "start" and "end," which are both Dates.'
  ),
  onChange: PropTypes.func.describe(
    'A function called when the date range is closed. It receives an object with two Date properties: start and end.'
  ),
  align: PropTypes.string.describe(
    'The side to align the range selector with. Possible options are Constants.Directions.LEFT or Constants.Directions.RIGHT.'
  ),
};
