import React, { Component } from 'react';

import Icon  from 'components/Icon/Icon.react';

import Button from 'components/back4App/Button/Button.react';

import styles from 'components/back4App/Sidebar/Sidebar.scss';

import navData from 'components/back4App/Header/headerNavData.js';

const _renderHeaderMenuItems = items => items.map(({label, pathname, url}, index) => (
  <div key={index} className={styles['menu-item']}>
    <div className={`${styles['menu-item-header']} ${index === 1 && styles.active}`} role="tab">
      <a className={styles.link} href={pathname || url} title="Edit email">
        <i className={`${styles['icon-circle']} zmdi zmdi-circle`}></i>
        {label}
      </a>
      <i className={`${styles['icon-caret']} zmdi zmdi-caret-left`}></i>
    </div>
  </div>
));

let SidebarNav = props => {
  return (
    <nav className={styles.menu} id="accordion" role="tablist" aria-multiselectable="true">
      {_renderHeaderMenuItems(navData.items)}
    </nav>
  );
};

let sidebarContent = (
  <div>
    <header>
      <a className={styles.brand} href="//dashboard.back4app.com">
        <div className={styles.face}>
          <Icon width={46} height={47} name="back4app-logo-face-blue" fill="#208AEC" />
        </div>
        <div className={styles.text}>
          <Icon width={134} height={53} name="back4app-logo-text-blue" fill="#208AEC" />
        </div>
      </a>
    </header>

    <div className={styles['menu-wrapper']}>
      { <SidebarNav items={navData.items} /> }
    </div>

    <footer className={styles.footer}>
      <Button customClasses={styles['new-app-button']} color="green" weight="700" url="http://localhost:8090/apps/#!/apps/new">NEW APP</Button>

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