/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/Loader/Loader.scss';

const SMALL_RADIUS = 20;
const LARGE_RADIUS = 50;
const DURATION = 3000;

const LENGTH = 1.5 * (SMALL_RADIUS + LARGE_RADIUS) * Math.PI + 2 * (SMALL_RADIUS + LARGE_RADIUS);

const POINTS = {
  A: (1.5 * SMALL_RADIUS * Math.PI) / LENGTH, // End of first loop
  B: (1.5 * SMALL_RADIUS * Math.PI + SMALL_RADIUS + LARGE_RADIUS) / LENGTH, // Beginning of second loop
  C: (1.5 * (SMALL_RADIUS + LARGE_RADIUS) * Math.PI + SMALL_RADIUS + LARGE_RADIUS) / LENGTH, // End of second loop
};

function getRadius(t) {
  return 40 - 60 * Math.abs(t - 0.5);
}

function getPosition(t) {
  if (t < POINTS.A) {
    let multiplier = LENGTH / SMALL_RADIUS;
    return {
      x: SMALL_RADIUS + SMALL_RADIUS * Math.cos(t * multiplier + Math.PI / 2),
      y: 2 * LARGE_RADIUS + SMALL_RADIUS - SMALL_RADIUS * Math.sin(t * multiplier + Math.PI / 2)
    };
  } else if (t < POINTS.B) {
    return {
      x: 2 * SMALL_RADIUS,
      y: LENGTH * (POINTS.A - t) + 2 * LARGE_RADIUS + SMALL_RADIUS
    };
  } else if (t < POINTS.C) {
    let t2 = t - POINTS.B;
    let multiplier = LENGTH / LARGE_RADIUS;
    return {
      x: 2 * SMALL_RADIUS + LARGE_RADIUS - LARGE_RADIUS * Math.cos(t2 * multiplier),
      y: LARGE_RADIUS - LARGE_RADIUS * Math.sin(t2 * multiplier)
    };
  } else {
    return {
      x: LENGTH * (POINTS.C - t) + 2 * SMALL_RADIUS + LARGE_RADIUS,
      y: 2 * LARGE_RADIUS
    };
  }
}

export default class Loader extends React.Component {
  componentDidMount() {
    this.mounted = true;
    this.mountTime = new Date().getTime();
    requestAnimationFrame(this.animate.bind(this));
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  animate() {
    if (!this.mounted) {
      return;
    }
    let delta = new Date() - this.mountTime;
    let t = (delta / DURATION) % 1;
    let pos = getPosition(t);
    let style = this.refs.dot0.style;
    style.left = pos.x + 'px';
    style.top = pos.y + 'px';
    style.width = style.height = getRadius(t) + 'px';

    t = (delta / DURATION + 0.4) % 1;
    pos = getPosition(t);
    style = this.refs.dot1.style;
    style.left = pos.x + 'px';
    style.top = pos.y + 'px';
    style.width = style.height = getRadius(t) + 'px';

    t = (delta / DURATION + 0.8) % 1;
    pos = getPosition(t);
    style = this.refs.dot2.style;
    style.left = pos.x + 'px';
    style.top = pos.y + 'px';
    style.width = style.height = getRadius(t) + 'px';

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    let classes = styles.loader;
    if (this.props.className) {
      classes += ' ' + this.props.className;
    }
    return (
      <div className={classes}>
        <div ref='dot0' />
        <div ref='dot1' />
        <div ref='dot2' />
      </div>
    );
  }
}
