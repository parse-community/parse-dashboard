/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'components/Table/Table.scss';

let TableHeader = ({ width, ...props }) => {
  let style = {};
  if (width !== undefined) {
    style.width = width + '%';
  }
  return <div {...props} style={style} className={styles.header} />;
}

export default TableHeader;
