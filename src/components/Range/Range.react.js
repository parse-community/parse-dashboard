/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { input } from 'components/Field/Field.scss';
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/Range/Range.scss';

const DEFAULT_COLOR = '#fd9539';

export default class Range extends React.Component {
  constructor(props) {
    super();
    this.state = { width: props.width };
  }

  componentDidMount() {
    if (!this.props.width) {
      this.setState({ width: this.refs.metrics.clientWidth });
    }
  }

  changeValue(e) {
    this.props.onChange(parseInt(e.nativeEvent.target.value, 10));
  }

  buildGradient() {
    let fillLevel = this.props.value / (this.props.max - this.props.min) * 100 + '%';
    let fillColor = this.props.color || DEFAULT_COLOR;
    return `linear-gradient(90deg, ${fillColor}, ${fillColor} ${fillLevel}, #e0e0ea ${fillLevel}, #e0e0ea)`;
  }

  render() {
    let trackerStyle = {};
    if (this.state.width) {
      let left = this.props.value / (this.props.max - this.props.min) * (this.state.width - 24) + 11;
      trackerStyle = { left };
    }
    if (this.props.color) {
      trackerStyle.backgroundColor = this.props.color;
      trackerStyle.borderTopColor = this.props.color;
    }
    let tracker = null;
    let unitsText = (typeof this.props.units === 'function') ?
      this.props.units(this.props.value) :
      this.props.value + (this.props.units || '');
    if (this.props.track && this.state.width) {
      tracker = (
        <div
          className={styles.tracker}
          style={trackerStyle}>
          {unitsText}
        </div>
      );
    }
    let wrapperStyle = {};
    if (this.props.width) {
      wrapperStyle.width = this.props.width;
    }
    return (
      <div
        style={wrapperStyle}
        ref='metrics'
        className={[styles.range, input].join(' ')}>
        {tracker}
        <input
          type='range'
          min={this.props.min}
          max={this.props.max}
          step={this.props.step || 1}
          value={this.props.value}
          style={{ backgroundImage: this.buildGradient() }}
          onChange={this.changeValue.bind(this)} />
      </div>
    );
  }
}

Range.propTypes = {
  min: PropTypes.number.isRequired.describe(
    'The minimum value on the slider'
  ),
  max: PropTypes.number.isRequired.describe(
    'The maximum value on the slider'
  ),
  step: PropTypes.number.describe(
    'Adjusts the granularity of the slider. If this is set, the slider will only move in increments of this size.'
  ),
  value: PropTypes.number.isRequired.describe(
    'The current value of this controlled input'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function called whenever the input is adjusted'
  ),
  width: PropTypes.number.describe(
    'The physical width, in pixels, of the slider track'
  ),
  units: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).describe(
    'A string displayed as after the number in the tracker, or a function that accepts the value of the tracker, and returns the string to be displayed in the tracker.'
  ),
};
