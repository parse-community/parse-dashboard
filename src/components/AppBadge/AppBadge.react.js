/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/AppBadge/AppBadge.scss';

let AppBadge = ({ production }) => (
  <span className={production ? [styles.badge, styles.prod].join(' ') : styles.badge}>
    {production ? 'PROD' : 'DEV'}
  </span>
);

export default AppBadge;

AppBadge.propTypes = {
  production: PropTypes.bool.describe(
    'Indicates whether the app is in production mode or not.'
  )
};
