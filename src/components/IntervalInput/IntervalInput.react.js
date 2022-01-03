/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import PropTypes from 'lib/PropTypes';
import React from 'react';

let IntervalInput = ({ count, unit, onChange }) => {
  let counts = [];
  let max = (unit === 'hour') ? 23 : 59;
  for (let i = 1; i <= max; i++) {
    counts.push(<Option key={'count'+i} value={String(i)}>{String(i)}</Option>);
  }

  let countChange = (newCount) => onChange(parseInt(newCount, 10), unit);
  let unitChange = (newUnit) => {
    if (newUnit === 'minute') {
      return onChange(count, newUnit);
    } else {
      return onChange(Math.min(23, count), newUnit);
    }
  }

  return (
    <div>
      <Dropdown width='50%' value={String(count)} onChange={countChange}>
        {counts}
      </Dropdown>
      <Dropdown width='50%' value={unit} onChange={unitChange}>
        <Option value={'minute'}>{count === 1 ? 'Minute' : 'Minutes'}</Option>
        <Option value={'hour'}>{count === 1 ? 'Hour' : 'Hours'}</Option>
      </Dropdown>
    </div>
  );
};

export default IntervalInput;

IntervalInput.propTypes = {
  count: PropTypes.number.isRequired,
  unit: PropTypes.oneOf(['minute', 'hour']),
  onChange: PropTypes.func.isRequired
};
