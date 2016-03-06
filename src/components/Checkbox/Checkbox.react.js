/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon   from 'components/Icon/Icon.react';
import React  from 'react';
import styles from 'components/Checkbox/Checkbox.scss';

let Checkbox = ({ label, checked, indeterminate, onChange }) => {
  let classes = [styles.input];
  if (checked) {
    classes.push(styles.checked);
  } else if (indeterminate) {
    classes.push(styles.indeterminate);
  }
  let inner = null;
  if (checked) {
    inner = <Icon width={12} height={12} name='check' fill='#169cee' />;
  } else if (indeterminate) {
    inner = <span className={styles.minus} />;
  }
  return (
    <span className={classes.join(' ')} onClick={() => onChange(!checked)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.checkbox}>{inner}</span>
    </span>
  );
};

export default Checkbox;
