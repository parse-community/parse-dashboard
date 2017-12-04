import React, { Component } from 'react';

import Icon  from 'components/Icon/Icon.react';

import styles from 'components/back4App/Sidebar/Sidebar.scss';

let sidebarContent = (
  <div>
    <header>
      <a className={styles.brand } href="//dashboard.back4app.com">
        <div className={styles['face']}>
          <Icon width={46} height={47} name="back4app-logo-face-blue" fill="#208AEC" />
        </div>
        <div className={styles['text']}>
          <Icon width={134} height={53} name="back4app-logo-text-blue" fill="#208AEC" />
        </div>
      </a>
    </header>

    <div className={styles['menu-wrapper']}>
      <nav className={styles['menu'] } id="accordion" role="tablist" aria-multiselectable="true">

        <div className={styles['menu-item']}>
          <div className={styles['menu-item-header']} role="tab">
            <a className={styles['link']} href="https://dashboard.back4app.com/email/change" title="Edit email">
              <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
              My Apps
            </a>
            <i className={`${styles['icon-caret']} ${styles['active']} zmdi zmdi-caret-left`}></i>
          </div>
        </div>

        <div className={styles['menu-item']}>
          <div className={styles['menu-item-header']} role="tab">
            <a className={styles['link']} href="https://dashboard.back4app.com/email/change" title="Edit email">
              <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
              Dashboard
            </a>
            <i className={`${styles['icon-caret']} ${styles['active']} zmdi zmdi-caret-left`}></i>
          </div>
        </div>

        <div className={styles['menu-item']}>
          <div className={styles['menu-item-header']} role="tab">
            <a className={styles['link']} href="https://dashboard.back4app.com/email/change" title="Edit email">
              <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
              Docs
            </a>
            <i className={`${styles['icon-caret']} ${styles['active']} zmdi zmdi-caret-left`}></i>
          </div>
        </div>

        <div className={styles['menu-item']}>
          <div className={styles['menu-item-header']} role="tab">
            <a className={styles['link']} href="https://dashboard.back4app.com/email/change" title="Edit email">
              <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
              Community
            </a>
            <i className={`${styles['icon-caret']} ${styles['active']} zmdi zmdi-caret-left`}></i>
          </div>
        </div>

        <div className={styles['menu-item']}>
          <div className={styles['menu-item-header']} role="tab">
            <a className={styles['link']} href="https://dashboard.back4app.com/email/change" title="Edit email">
              <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
              Blog
            </a>
            <i className={`${styles['icon-caret']} ${styles['active']} zmdi zmdi-caret-left`}></i>
          </div>
        </div>

      </nav>
    </div>

    <footer className={styles.footer}>
      <a className={styles['create-new']} href="/apps/#!/apps/new">NEW APP</a>
      <div className={styles.account}>
        <a href="https://dashboard.back4app.com/logout" className={styles['sign-out']}>Sign Out</a>
      </div>
    </footer>
  </div>
);

class Sidebar extends Component { 
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      isOpen: nextProps.isOpen
    });
  }
   
  render() {
    let { isOpen } = this.state;
    let { sidebarToggle } = this.props;

    return (
      <div className={styles['sidebar-wrapper']}>
        <aside className={`${styles['sidebar']} ${isOpen && styles['open']}`}>
          { sidebarContent }
        </aside>
        <div onClick={() => {
          sidebarToggle();
        }} className={styles['sidebar-outside']}></div>
      </div>
    );
  }
}

export default Sidebar;