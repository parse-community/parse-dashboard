/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React        from 'react';
import styles       from 'components/LogView/LogView.scss';

let LogView = (props) => {
  return (
    <ol className={styles.view}>
      {props.children}
    </ol>
  );
}

export default LogView;
