import React from 'react';

import styles from 'components/back4App/NotificationBullet/NotificationBullet.scss';

const NotificationBullet = props => (
  <div className={styles['notification-bullet']}>
    { props.notification }
  </div>
);

export default NotificationBullet;