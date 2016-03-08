/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/SegmentSelect/SegmentSelect.scss';

let SegmentSelect = ({ values, current, onChange }) => (
  <div className={styles.row}>
    {values.map((v) => (
      <a
        key={v}
        className={v === current ? styles.current : null}
        onClick={() => {
          if (current !== v) {
            onChange(v)
          }
        }}>
        {v}
      </a>
    ))}
  </div>
);

export default SegmentSelect;

SegmentSelect.propTypes = {
  values: PropTypes.arrayOf(PropTypes.string).isRequired.describe(
    'An array of strings that can be selected'
  ),
  current: PropTypes.string.describe(
    'The currently selected value.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function that is called whenever a new segment is selected. The selected value is passed as the only parameter.'
  )
};
