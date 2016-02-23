/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Charting     from 'lib/Charting.js'
import * as DateUtils    from 'lib/DateUtils';
import Position          from 'lib/Position';
import prettyNumber      from 'lib/prettyNumber';
import PropTypes         from 'lib/PropTypes';
import React             from 'react';
import Shape             from 'components/Chart/Shape.react';
import { shortMonth }    from 'lib/DateUtils';
import styles            from 'components/Chart/Chart.scss';

const MARGIN_TOP = 10;
const MARGIN_RIGHT = 20;
const MARGIN_BOTTOM = 40;
const MARGIN_LEFT = 40;

function sortPoints(a, b) {
  return a[0] - b[0];
}

function formatDate(date) {
  let str = DateUtils.getMonth(date.getMonth()) + ' ' + date.getDate();
  if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0) {
    return str;
  }
  return str + ' ' + date.getHours() + (date.getMinutes() < 10 ? ':0' : ':') + date.getMinutes();
}

export default class Chart extends React.Component {
  constructor() {
    super();

    this.state = {
      hoverTime: null,
      hoverValue: null,
      hoverPosition: null,
      hoverColor: '',
    };
  }

  handleMouseOver(x, y, time, value, color, label) {
    this.setState({
      hoverTime: new Date(time),
      hoverValue: value,
      hoverLabel: label,
      hoverPosition: new Position(x, y),
      hoverColor: color,
    });
  }

  handleMouseOut() {
    this.setState({ hoverValue: null });
  }

  render() {
    let { width, height, data } = this.props;
    let plotting = {};
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    let chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
    let chartHeight = height - MARGIN_TOP - MARGIN_BOTTOM;

    for (let key in data) {
      let ordered = data[key].points.map(([x, y]) => [x, y]).sort(sortPoints);
      for (let i = 0; i < ordered.length; i++) {
        if (ordered[i][0] < minX) {
          minX = ordered[i][0];
        }
        if (ordered[i][0] > maxX) {
          maxX = ordered[i][0];
        }
        if (ordered[i][1] > maxY) {
          maxY = ordered[i][1];
        }
      }
      plotting[key] = { data: ordered, index: data[key].index };
    }
    let timeBuckets = Charting.timeAxisBuckets(minX, maxX);
    let valueBuckets = Charting.valueAxisBuckets(maxY || 10);
    let groups = [];
    for (let key in plotting) {
      let color = data[key].color;
      let index = data[key].index || 0;
      let points = Charting.getDataPoints(chartWidth, chartHeight, timeBuckets, valueBuckets, plotting[key].data);
      let path = <path d={'M' + points.map((p) => p.join(' ')).join(' L')} style={{ stroke: color, fill: 'none', strokeWidth: 2 }} />;
      groups.push(
        <g key={key}>
          {path}
          {points.map((p, i) => (
            <g
              key={p[0]}
              onMouseOver={this.handleMouseOver.bind(this, p[0] + MARGIN_LEFT, p[1], plotting[key].data[i][0], plotting[key].data[i][1], color, key)}
              onMouseOut={this.handleMouseOut.bind(this)}
              style={{ cursor: 'pointer' }}>
              <Shape x={p[0]} y={p[1]} fill={color} index={index} />
            </g>
          ))}
        </g>
      );
    }
    let labels = valueBuckets.slice(1, valueBuckets.length - 1);
    let labelHeights = labels.map((label) => chartHeight * (1 - label / valueBuckets[valueBuckets.length - 1]));
    let tickPoints = timeBuckets.map((t) => chartWidth * (t - timeBuckets[0]) / (timeBuckets[timeBuckets.length - 1] - timeBuckets[0]));
    let last = null;
    let tickLabels = timeBuckets.map((t, i) => {
      let text = '';
      if (timeBuckets.length > 20 && i % 2 === 0) {
        return '';
      }
      if (!last || t.getMonth() !== last.getMonth()) {
        text += shortMonth(t.getMonth()) + ' ';
      }
      if (!last || t.getDate() !== last.getDate()) {
        text += t.getDate();
      } else if (last && t.getHours() !== last.getHours()) {
        text += t.getHours() + ':00';
      }
      last = t;
      return text;
    });
    let popup = null;
    if (this.state.hoverValue !== null) {
      let style = {
        color: this.state.hoverColor,
        borderColor: this.state.hoverColor,
      };
      let classes = [styles.popup];
      if (this.state.hoverPosition.x < 200) {
        classes.push(styles.popupRight);
      } else {
        classes.push(styles.popupLeft);
      }
      popup = (
        <div
          className={styles.popupWrap}
          style={{
            left: this.state.hoverPosition.x,
            top: this.state.hoverPosition.y,
          }}>
          <div
            className={classes.join(' ')}
            style={style}>
            <div className={styles.popupTime}>{formatDate(this.state.hoverTime)}</div>
            <div className={styles.popupValue}>{this.props.formatter ? this.props.formatter(this.state.hoverValue, this.state.hoverLabel) : this.state.hoverValue}</div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.chart} style={{ width: width, height: height }}>
        <div className={styles.yAxis}>
          {labels.map((v, i) => <div key={v} className={styles.label} style={{ top: labelHeights[i] }}>{prettyNumber(v)}</div>)}
        </div>
        <div className={styles.xAxis}>
          {tickLabels.map((t, i) => <div key={t + '_' + i} className={styles.tick} style={{ left: tickPoints[i] + MARGIN_LEFT }}>{t}</div>)}
        </div>
        <svg width={chartWidth + 10} height={chartHeight + 10}>
          <g>{labelHeights.map((h) => <path key={'horiz_' + h} d={'M0 ' + h + ' H' + chartWidth} style={{ stroke: '#e1e1e1', strokeWidth: 0.5 }} />)}</g>
          <path d={'M0 ' + chartHeight + ' H' + chartWidth} style={{ stroke: '#e1e1e1', strokeWidth: 1 }} />
          <g>{tickPoints.map((t, i) => <path key={'tick_' + i} d={`M${t} ${chartHeight} V ${chartHeight - 10}`} style={{ stroke: '#e1e1e1', strokeWidth: 1 }} />)}</g>
          {groups}
        </svg>
        {popup}
      </div>
    );
  }
}

Chart.propTypes = {
  width: PropTypes.number.isRequired.describe(
    'The width of the chart.'
  ),
  height: PropTypes.number.isRequired.describe(
    'The height of the chart.'
  ),
  data: PropTypes.object.isRequired.describe(
    'The data to graph. It is a map of data names to objects containing two keys: ' + 
    '"color," the color to use for the lines, and "points," an array of tuples containing time-value data.'
  ),
  formatter: PropTypes.func.describe(
    'An optional function for formatting the data description that appears in the popup. ' +
    'It receives the numeric value of a point and label, and should return a string. ' +
    'This is ideally used for providing descriptive units like "active installations."'
  )
};
