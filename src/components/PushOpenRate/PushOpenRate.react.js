/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/PushOpenRate/PushOpenRate.scss';

function getRateString(rateNum) {
  let rateStr;
  if (rateNum % 1 === 0) {
    // Integer rate
    rateStr = rateNum.toFixed(0);
  } else if (rateNum < 10) {
    // e.g. 0.01%, 1.23%
    rateStr = rateNum.toFixed(2);
  } else {
    // e.g. 34.9%, 100%
    rateStr = rateNum.toPrecision(3);
  }
  return rateStr;
}

let PushOpenRate = ({
    numOpened,
    numSent,
    color,
    isExperiment = false,
    isWinner = false,
    customColor,
  }) => {
  let rateNum = numOpened / numSent * 100;
  if(isNaN(rateNum)){ //check for case when numSent is 0
    rateNum = 0;
  }
  /* eslint-disable no-unused-vars */
  let rateStr = getRateString(rateNum);
  /* eslint-enable */

  let customStyles = {
    standardColor: {},
    inverseColor: {},
  };

  //handle non standard blue/yellow/pink cases
  if (customColor) {
    customStyles.standard = {
      color: customColor,
      background: 'white',
    };

    customStyles.inverse = {
      color: 'white',
      background: customColor,
    };
  }

  return (
    <div className={styles.wrapper}>
      {isExperiment ?
        <div style={customStyles[isWinner ? 'standard' : 'inverse']} className={[styles.title, styles[color]].join(' ')}>{isWinner ? 'WINNER' : ''}</div>
        : null}
      <div style={customStyles[isWinner ? 'inverse' : 'standard']} className={[styles.percent, styles[color + (isWinner ? '_inv' : '')]].join(' ')}>
        { /*<div className={styles.rate}>{rateStr}%</div>*/ }
        <div className={styles.rate}>N/A</div>
        <div className={styles.rate_label}>Open Rate</div>
      </div>
      <div className={styles.count_wrap} style={{ float: 'left', width: '50%' }}>
        { /*<div className={styles.count}>{numOpened}</div>*/ }
        <div className={styles.count}>N/A</div>
        <div className={styles.count_label}>Push Opens</div>
      </div>
      <div className={styles.count_wrap} style={{ marginLeft: '50%' }}>
        <div className={styles.count}>{numSent}</div>
        <div className={styles.count_label}>Push Sends</div>
      </div>
    </div>
  );
};

export default PushOpenRate;

PushOpenRate.propTypes = {
  numOpened: PropTypes.number.isRequired.describe(
    'Number of pushes opened.'
  ),
  numSent: PropTypes.number.isRequired.describe(
    'Number of pushes sent'
  ),
  color: PropTypes.oneOf(['blue', 'yellow', 'pink']).isRequired.describe(
    'Color of text and circle'
  ),
  isExperiment: PropTypes.bool.describe(
    'Whether or not this is an A/B test group'
  ),
  isWinner: PropTypes.bool.describe(
    'Whether or not this group won the A/B test'
  ),
};
