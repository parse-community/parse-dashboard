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

let MultiSelectOption = ({ checked, children, dense, disabled, ...other }) => {
  
  const classes = [styles.option,
  disabled? styles.disabled: undefined
  ];
  
  const icon = checked ? (
    <div className={styles.checked}>
      <Icon
        width={dense ? 15 : 20}
        height={dense ? 15 : 20}
        name="check"
        fill="#ffffff"
      />
    </div>
  ) : (
    <div className={styles.unchecked} />
  )
  
  return (

  <div {...other} className={classes.join(' ')}>
    {children}
    {disabled ? <noscript/> : icon}
  </div>
);
}

export default MultiSelectOption;
