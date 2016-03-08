/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/StatusIndicator/StatusIndicator.scss';

let StatusIndicator = ({ text, color }) => {
  color = color || 'blue';
  return (
    <span className={[styles.status, styles[color]].join(' ')}>
      {text}
    </span>
  );
};

StatusIndicator.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red'])
};

export default StatusIndicator;
