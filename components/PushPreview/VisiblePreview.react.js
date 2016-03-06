/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as DateUtils from 'lib/DateUtils';
import React          from 'react';
import styles         from 'components/PushPreview/PushPreview.scss';

let VisiblePreview = ({ type, message, time, appName, fade, isLocal }) => {
  let timeString = time[DateUtils.getDateMethod(isLocal, 'getHours')]() + ':';
  if (time.getUTCMinutes() < 10) {
    timeString += '0';
  }
  timeString += time[DateUtils.getDateMethod(isLocal, 'getMinutes')]();
  let dateString = DateUtils.WEEKDAYS[time[DateUtils.getDateMethod(isLocal, 'getDay')]()] + ', ' + DateUtils.MONTHS[time[DateUtils.getDateMethod(isLocal, 'getMonth')]()] + ' ' + time[DateUtils.getDateMethod(isLocal, 'getDate')]();
  let notificationTime = null;
  if (type === 'android') {
    notificationTime = <div className={styles.notifTime}>{timeString}</div>;
  }
  if (type === 'ios') {
    notificationTime = <div className={styles.notifTime}>{DateUtils.WEEKDAYS[time[DateUtils.getDateMethod(isLocal, 'getDay')]()].substr(0, 3) + ' ' + timeString}</div>;
  }
  return (
    <div className={[styles.preview, styles[type]].join(' ')}>
      <div className={styles.time}>{timeString}</div>
      <div className={styles.date}>{dateString}</div>
      <div className={styles.messageBox}>
        <div className={styles.appIcon} />
        <div className={styles.appName}>{appName}</div>
        {notificationTime}
        <div className={styles.message}>{message}</div>
      </div>
      {fade ? <div className={styles.fade} /> : null}
    </div>
  );
};

export default VisiblePreview;
