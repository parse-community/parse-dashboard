/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon      from 'components/Icon/Icon.react';
import React     from 'react';
import styles    from 'components/MultiSelect/MultiSelect.scss';

let MultiSelectOption = ({ checked, children, ...other }) => (
  <div {...other} className={styles.option}>
    {children}
    {checked ?
      <div className={styles.checked}>
        <Icon width={20} height={20} name='check' fill='#ffffff' />
      </div> :
      <div className={styles.unchecked} />
    }
  </div>
);

export default MultiSelectOption;
