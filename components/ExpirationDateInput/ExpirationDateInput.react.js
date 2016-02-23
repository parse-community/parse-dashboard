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

let months = [];
for (let i = 1; i <= 12; i++) {
  let value = (i < 10 ? '0' : '') + String(i);
  months.push(<Option key={'m' + i} value={String(i)}>{value}</Option>);
}
let years = [];
let startYear = new Date().getFullYear();
for (let i = 0; i < 10; i++) {
  let value = String(startYear + i);
  years.push(<Option key={'y' + i} value={value}>{value}</Option>);
}

let ExpirationDateInput = ({ month, year, onChange }) => {
  return (
    <div>
      <Dropdown
        width='40%'
        value={String(month)}
        onChange={(value) => onChange({ month: parseInt(value, 10), year: year })}>
        {months}
      </Dropdown>
      <Dropdown
        width='60%'
        value={String(year)}
        onChange={(value) => onChange({ month: month, year: parseInt(value, 10) })}>
        {years}
      </Dropdown>
    </div>
  );
};

export default ExpirationDateInput;

ExpirationDateInput.propTypes = {
  month: PropTypes.number.describe(
    'The expiration month.'
  ),
  year: PropTypes.number.describe(
    'The expiration year, in four-digit form.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function called when the value changes. It receives an object with two parameters: the month and the year.'
  )
};
