/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/Tooltip/Tooltip.scss';

let Tooltip = ({ value, children }) => {
  return (
    <div className={styles.tooltipWrap}>
      {children}
      <div className={styles.tooltip}>
        <div className={styles.tooltipContent}>
          {value}
        </div>
        <div className={styles.callout1} />
        <div className={styles.callout2} />
      </div>
    </div>
  );
};

export default Tooltip;

Tooltip.propTypes = {
  value: PropTypes.node.isRequired.describe(
    'The tooltip text.'
  ),
  children: PropTypes.node.describe(
    'The content that should reveal a tooltip when hovered.'
  )
};
