/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/Toolbar/Toolbar.scss';

let Toolbar = (props) => (
  <div className={styles.toolbar}>
    <div className={styles.title}>
      <div className={styles.section}>{props.section}</div>
      <div>
        <span className={styles.subsection}>
          {props.subsection}
        </span>
        <span className={styles.details}>
          {props.details}
        </span>
      </div>
    </div>
    <div className={styles.actions}>
      {props.children}
    </div>
  </div>
);

Toolbar.propTypes = {
  section: PropTypes.string,
  subsection: PropTypes.string,
  details: PropTypes.string
};

export default Toolbar;
