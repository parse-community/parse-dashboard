/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import baseStyles      from 'stylesheets/base.scss';
import Icon            from 'components/Icon/Icon.react';
import React           from 'react';
import styles          from 'dashboard/Data/Migration/MigrationStep.scss';
import { AsyncStatus } from 'lib/Constants';

export default ({
  title,
  description,
  descriptionWidth = '100%',
  percentComplete = 0,
  status
}) => {
  if (isNaN(percentComplete) || percentComplete < 0 || percentComplete > 100) {
    percentComplete = 0;
  }
  let progressClass = '';
  let titleClass = '';
  let descriptionClass = '';
  let icon = null;
  switch (status) {
    case AsyncStatus.SUCCESS:
      percentComplete = 100;
      progressClass = baseStyles.succeededBackground;
      titleClass= baseStyles.succeededText;
      icon = <Icon name='check-solid' fill='#00db7c' width={15} height={15}/>;
      break;
    case AsyncStatus.FAILED:
      percentComplete = 100;
      progressClass = baseStyles.failedBackground;
      titleClass= baseStyles.failedText;
      icon = <Icon name='x-solid' fill='#ff395e' width={15} height={15}/>;
      break;
    case AsyncStatus.PROGRESS:
      progressClass = baseStyles.progressBackground;
      titleClass= baseStyles.progressText;
      break;
    case AsyncStatus.WAITING:
      percentComplete = 0;
      titleClass = styles.inactiveText;
      descriptionClass = styles.inactiveText;
  }
  return (
    <div className={styles.wrapper}>
      <div className={[styles.title, titleClass].join(' ')}>{title} {icon}</div>
      <div style={{width: descriptionWidth}}className={[styles.description, descriptionClass].join(' ')}>{description}</div>
      <div
        style={{width: percentComplete.toString() + '%'}}
        className={[styles.status, progressClass].join(' ')} />
      <div
        style={{
          width: (100 - percentComplete).toString() + '%',
          left: percentComplete.toString() + '%',
        }}
        className={styles.progressBackground} />
    </div>
  );
};
