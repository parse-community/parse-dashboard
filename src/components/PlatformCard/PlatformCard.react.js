/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon      from 'components/Icon/Icon.react';
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/PlatformCard/PlatformCard.scss';

const FILL = {
  blue: '#169cee',
  green: '#00db7c',
  red: '#ff395e',
};

let PlatformCard = ({ platform, name, subtitle, color }) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}><Icon name={platform} fill={FILL[color]} width={50} height={50} /></div>
      <div className={styles.right}>
        <div className={styles.name}>{name}</div>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

export default PlatformCard;

PlatformCard.propTypes = {
  platform: PropTypes.oneOf([
    'ios', 'android', 'xamarin', 'unity', 'php', 'windows', 'dotnet', 'arduino', 'rpi', 'rtos'
  ]).isRequired.describe(
    'The platform name. This will determine the icon.'
  ),
  name: PropTypes.string.isRequired.describe(
    'The display name.'
  ),
  subtitle: PropTypes.string.describe(
    'Additional string that will be rendered below the display name.'
  ),
  color: PropTypes.oneOf(['red', 'green', 'blue']).describe(
    'A valid color, used as the fill of the icon.'
  ),
};
