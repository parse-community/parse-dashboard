import React, { Component } from 'react';

import { Link } from 'react-router';

import history from 'dashboard/history';

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
      isCurrent: false
    }
  }

  checkIfIsCurrent(currentUrl, itemUrl) {
    return currentUrl === itemUrl;
  }

  componentWillMount() {
    history.listen(location => {
      let isCurrent = this.checkIfIsCurrent(`${location.basename}${location.pathname}`, this.props.url) ||
      this.checkIfIsCurrent(`${location.basename}${location.pathname}`, this.props.pathname);

      if(this.state.isCurrent !== isCurrent) {
        this.setState({
          isCurrent
        });
      }
    });
  }

  render() {
    let { isCurrent } = this.state;
    return NavItem({...this.props, isCurrent});
  }
}
