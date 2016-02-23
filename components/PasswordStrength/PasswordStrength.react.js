/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/PasswordStrength/PasswordStrength.scss';

const tips = [
  'It should be at least 8 characters',
  'Consider making your password stronger',
  'Looks great'
];

let PasswordStrength = ({ strength }) => {
  return (
    <div className={styles.strength}>
      <div className={strength === 2 ? styles.green : styles.grey} />
      <div className={strength === 2 ? styles.green : (strength === 1 ? styles.yellow : styles.grey)} />
      <div className={strength === 2 ? styles.green : (strength === 1 ? styles.yellow : (strength === 0 ? styles.red : styles.grey))} />
      {strength > -1 ? <div className={styles.tip}>{tips[strength]}</div> : null}
    </div>
  );
};

export default PasswordStrength;
