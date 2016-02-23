/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/Chart/Chart.scss';

function joinPoints(points) {
  return points.map((p) => p.join(',')).join(' ');
}

let Shape = ({ x, y, fill, index }) => {
  let style = { fill: fill, stroke: 'white', strokeWidth: 2 };
  switch (index % 7) {
    case 0:
      return <circle className={styles.grow} cx={x} cy={y} r={4} style={style} />;
    case 1:
      return <rect className={styles.grow} x={x - 4} y={y - 4} width={8} height={8} style={style} />;
    case 2:
      return <polygon className={styles.grow} points={joinPoints([[x - 4, y + 4], [x, y - 4], [x + 4, y + 4]])} style={style} />;
    case 3:
      return <polygon className={styles.grow} points={joinPoints([[x - 4, y], [x, y - 4], [x + 4, y], [x, y + 4]])} style={style} />;
    case 4:
      return <polygon className={styles.grow} points={joinPoints([[x - 4, y - 4], [x, y + 4], [x + 4, y - 4]])} style={style} />;
    case 5:
      return <polygon className={styles.grow} points={joinPoints([[x, y - 4], [x + 4, y - 1], [x + 2, y + 3], [x - 2, y + 3], [x - 4, y - 1]])} style={style} />;
    case 6:
      return <polygon className={styles.grow} points={joinPoints([[x, y - 4], [x - 3, y - 2], [x - 3, y + 2], [x, y + 4], [x + 3, y + 2], [x + 3, y - 2]])} style={style} />;
  }
};

export default Shape;
