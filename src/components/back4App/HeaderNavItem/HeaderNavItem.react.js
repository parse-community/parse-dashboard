import React, { Component } from 'react';

import { Link } from 'react-router';

import styles from 'components/back4App/HeaderNavItem/HeaderNavItem.scss';

let NavItem = props => {
  return (
    <li className={`${styles.item} ${props.isCurrent ? styles.active : ''}`}>
      {
        props.url ? <a className={styles.label} href={props.url}>{props.label}</a> :
        props.pathname ? <Link className={styles.label} to={{ pathname:props.pathname }}>{props.label}</Link>:
        null
      }
      <i className={`${styles.icon} zmdi zmdi-caret-up`}></i>
    </li>
  );
}

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
    return NavItem({...this.props, isCurrent});
  }
}
