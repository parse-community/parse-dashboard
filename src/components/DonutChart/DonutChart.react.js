/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/DonutChart/DonutChart.scss';

const CHART_COLORS = [
  '#b9e88b',
  '#fac786',
  '#80eeef',
  '#dfb3eb',
  '#fd9fb0'
];

const MONOCHROME_COLORS = [
  '#3b2c48',
  '#e0e0ea'
];

let DonutChart = ({ segments=[], diameter=200, label='', isMonochrome=false, printPercentage=false }) => {
  let centerX = diameter / 2;
  let centerY = centerX;
  let radius = centerX * 0.9;

  let lastX = centerX;
  let lastY = centerY - radius;
  let alpha = Math.PI / 2;

  let sum = 0.0;
  for (let i = 0; i < segments.length; ++i) {
    sum += segments[i];
  }

  let paths = [];
  for (let i = 0; i < segments.length; ++i) {
    let arc = segments[i] / sum * 2 * Math.PI;
    let angle = alpha - Math.min(arc, Math.PI);
    let endX = radius * Math.cos(angle) + centerX;
    let endY = -radius * Math.sin(angle) + centerY;

    let path = [
      'M', centerY, centerY,
      'L', lastX, lastY,
      'A', radius, radius, 0, 0, 1, endX, endY
    ];
    if (arc > Math.PI) {
      angle = alpha - arc;
      endX = radius * Math.cos(angle) + centerX;
      endY = -radius * Math.sin(angle) + centerY;
      path = path.concat(['A', radius, radius, 0, 0, 1, endX, endY]);
    }
    path.push('Z');

    paths.push(
      <path
        className={styles.path}
        d={path.join(' ')}
        style={{ fill: isMonochrome ? MONOCHROME_COLORS[i % 2] : CHART_COLORS[i], transformOrigin: `${centerY}px ${centerX}px 0px` }}
        key={`segment${i}`} />
    );

    lastX = endX;
    lastY = endY;
    alpha = angle;
  }

  return (
    <svg style={{ width: diameter, height: diameter }}>
      {paths}
      <circle className={styles.donutCenter} cx={centerX} cy={centerY} r={centerX * 0.8} />
      {segments.map((segment, i) => (
        <text className={styles.donutValue} textAnchor='middle' x={centerX} y={centerY} key={`segment${i}`}>
          {printPercentage ? (segment / sum * 100).toFixed(2) + '%' : segment}
        </text>
      ))}
      <text className={styles.donutLabel} textAnchor='middle' x={centerX} y={centerY + 20}>{label}</text>
    </svg>
  );
};

export default DonutChart;

DonutChart.propTypes = {
  'segments': PropTypes.arrayOf(PropTypes.number).isRequired.describe(
    'Values of the DonutChart.'
  ),
  'diameter': PropTypes.number.describe(
    'Width and height of the DonutChart.'
  ),
  'label': PropTypes.string.describe(
    'Additional string to be appended after each rendered value in DonutChart.'
  ),
  'isMonochrome': PropTypes.bool.describe(
    'Whether the DonutChart is monochrome/bicolor (usually used for progress bar).'
  ),
  'printPercentage': PropTypes.bool.describe(
    'Whether the DonutChart should render percentage of each segment instead of the actual value.'
  )
};
