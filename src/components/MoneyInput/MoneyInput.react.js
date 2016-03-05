/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/MoneyInput/MoneyInput.scss';

let MoneyInput = ({ enabled = true, value, onChange = () => {}}) => {
  return <input
    type={'text'}
    disabled={!enabled}
    className={styles.moneyInput}
    value={'$' + value.toString()}
    onChange={e => {
      onChange(e.nativeEvent.target.value);
    }}
  />
}

export default MoneyInput;

MoneyInput.propTypes = {
  enabled: PropTypes.bool.describe(
    'Determines whether the input is enabled.'
  ),
  onChange: PropTypes.func.describe(
    'A function fired when the input is changed. It receives the new value as its only parameter.'
  ),
  value: PropTypes.number.isRequired.describe(
    'The current value of the controlled input.'
  ),
};
