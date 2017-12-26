import React, { Component } from 'react';

import { Link } from 'react-router';

import NotificationBullet from 'components/back4App/NotificationBullet/NotificationBullet.react';

import styles from 'components/back4App/HeaderNavItem/HeaderNavItem.scss';

export default class HeaderNavItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCurrent: !!(props.index === 1)
    }
  }

  checkIfIsCurrent(currentUrl, itemUrl) {
    return currentUrl === itemUrl;
  }

  render() {
    let { isCurrent } = this.state;
    let { notification = '', url, pathname, label } = this.props;

    return (
      <li className={`${styles.item} ${isCurrent ? styles.active : ''}`}>
        {
          !!notification && <NotificationBullet notification={notification}></NotificationBullet>
        }
        {
          url ? <a className={styles.label} href={url}>{label}</a> :
          pathname ? <Link className={styles.label} to={{ pathname }}>{label}</Link> :
          null
        }
        <i className={`${styles.icon} zmdi zmdi-caret-up`}></i>
      </li>
    );
  }
}
