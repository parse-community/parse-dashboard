/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import React                   from 'react';
import styles                  from 'components/SliderWrap/SliderWrap.scss';

export default class SliderWrap extends React.Component {
  constructor() {
    super()
    this.metricsRef = React.createRef()
  }

  get metrics() {
    return this.metricsRef.current
  }

  componentDidMount() {
    if (this.props.expanded) {
      this.forceUpdate();
    }
  }

  _getMetric() {
    if (this.props.direction === Directions.LEFT ||
        this.props.direction === Directions.RIGHT) {
      return 'width';
    }
    if (!this.props.direction ||
        this.props.direction === Directions.UP ||
        this.props.direction === Directions.DOWN) {
      return 'height';
    }
    return 'both';
  }

  render() {
    let style = {};
    let metric = this._getMetric();
    if (!this.props.expanded || !this.metrics) {
      if (metric === 'width' || metric === 'both') {
        style.width = '0px';
      }
      if (metric === 'height' || metric === 'both') {
        style.height = '0px';
      }
    } else if (this.props.expanded && this.metrics) {
      if (metric === 'width' || metric === 'both') {
        style.width = this.metrics.clientWidth + 'px';
      }
      if (metric === 'height' || metric === 'both') {
        style.height = this.metrics.clientHeight + 'px';
      }
    }
    if (this.props.direction === Directions.LEFT) {
      style.margin = '0 0 0 auto';
    }
    return (
      <div className={styles.slider} style={style}>
        <div ref={this.metricsRef} className={styles.metrics} style={this.props.block ? { display: 'block' } : {}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
