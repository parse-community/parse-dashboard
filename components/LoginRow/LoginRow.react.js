/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/LoginRow/LoginRow.scss';

let LoginRow = ({ label, input, extra }) => (
  <label className={styles.row}>
    <div className={styles.label}>{label}</div>
    {extra ? <div className={styles.extra}>{extra}</div> : null}
    <div className={styles.input}>{input}</div>
  </label>
);

export default LoginRow;
