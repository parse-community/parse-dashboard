/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {
  getMonth,
  prevMonth,
  nextMonth,
  daysInMonth,
  WEEKDAYS,
  getDateMethod,
}                from 'lib/DateUtils';
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/Calendar/Calendar.scss';

export default class Calendar extends React.Component {
  constructor(props) {
    super();
    let now = props.value || new Date();
    this.state = {
      currentMonth: new Date(now[getDateMethod(props.local, 'getFullYear')](), now[getDateMethod(props.local, 'getMonth')](), 1)
    };
  }

  componentWillReceiveProps(props) {
    if (props.value) {
      this.setState({
        currentMonth: new Date(props.value[getDateMethod(props.local, 'getFullYear')](), props.value[getDateMethod(props.local, 'getMonth')](), 1)
      });
    }
  }

  handlePrev() {
    this.setState({
      currentMonth: prevMonth(this.state.currentMonth)
    });
  }

  handleNext() {
    this.setState({
      currentMonth: nextMonth(this.state.currentMonth)
    });
  }

  renderMonth() {
    return (
      <div className={styles.month}>
        <button type='button' onClick={this.handlePrev.bind(this)} />
        <button type='button' onClick={this.handleNext.bind(this)} />
        <div>{getMonth(this.state.currentMonth.getMonth()) + ' ' + this.state.currentMonth.getFullYear()}</div>
      </div>
    );
  }

  renderWeekdays() {
    return (
      <div className={styles.weekdays}>
        {WEEKDAYS.map((w) => <span key={w}>{w.substr(0, 2)}</span>)}
      </div>
    );
  }

  renderDays() {
    let isValueMonth = (
      this.props.value &&
      this.props.value[getDateMethod(this.props.local, 'getFullYear')]() === this.state.currentMonth.getFullYear() &&
      this.props.value[getDateMethod(this.props.local, 'getMonth')]() === this.state.currentMonth.getMonth()
    );
    let offset = this.state.currentMonth.getDay();
    let days = daysInMonth(this.state.currentMonth);
    let labels = [];
    for (let i = 0; i < offset; i++) {
      labels.push(<span key={'pad' + i} />);
    }
    for (let i = 1; i <= days; i++) {
      let isSelected = isValueMonth && (this.props.value[getDateMethod(this.props.local, 'getDate')]() === i);
      let className = isSelected ? styles.selected : '';
      let onChange = this.props.onChange.bind(
        null,
        this.props.local ?
          new Date(this.state.currentMonth.getFullYear(), this.state.currentMonth.getMonth(), i) :
          new Date(Date.UTC(this.state.currentMonth.getFullYear(), this.state.currentMonth.getMonth(), i))
      );
      labels.push(
        <button type='button' key={'day' + i} className={className} onClick={onChange}>{i}</button>
      );
    }
    let classes = [styles.days];
    if (isValueMonth && this.props.shadeBefore) {
      classes.push(styles.shadeBefore);
    }
    if (isValueMonth && this.props.shadeAfter) {
      classes.push(styles.shadeAfter);
    }
    return <div className={classes.join(' ')}>{labels}</div>;
  }

  render() {
    return (
      <div className={styles.calendar}>
        {this.renderMonth()}
        {this.renderWeekdays()}
        {this.renderDays()}
      </div>
    );
  }
}

Calendar.propTypes = {
  value: PropTypes.instanceOf(Date).describe(
    'The currently selected date'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A callback fired when a new date is selected. It receives a Date object as its only parameter.'
  ),
  shadeBefore: PropTypes.bool.describe(
    'Whether to shade the dates before the current selection'
  ),
  shadeAfter: PropTypes.bool.describe(
    'Whether to shade the dates after the current selection'
  ),
}
