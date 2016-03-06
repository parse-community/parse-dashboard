/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/Pill/Pill.scss';
//TODO: refactor, may want to move onClick outside or need to make onClick able to handle link/button a11y
let Pill = ({ value, onClick }) => (
  <span className={[styles.pill, onClick ? styles.action : void(0)].join(' ')} onClick={onClick}>{value}</span>
);

export default Pill;
