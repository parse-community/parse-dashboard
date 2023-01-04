/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import React          from 'react';
import styles         from 'components/SliderWrap/SliderWrap.scss';

export default class SliderWrap extends React.Component {
  constructor() {
    super();

    this.metricsRef = React.createRef();
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
    let node = this.metricsRef.current;
    if (!this.props.expanded || !node) {
      if (metric === 'width' || metric === 'both') {
        style.width = '0px';
      }
      if (metric === 'height' || metric === 'both') {
        style.height = '0px';
      }
    } else if (this.props.expanded && node) {
      if (metric === 'width' || metric === 'both') {
        style.width = node.clientWidth + 'px';
      }
      if (metric === 'height' || metric === 'both') {
        style.height = node.clientHeight + 'px';
      }
    }
    if (this.props.direction === Directions.LEFT) {
      style.margin = '0 0 0 auto';
    }
    return (
      <div className={styles.slider} style={style}>
        <div className={styles.metrics} style={this.props.block ? { display: 'block' } : {}} ref={this.metricsRef}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
