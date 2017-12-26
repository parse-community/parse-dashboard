import React from 'react';

import HeaderNavItem from 'components/back4App/HeaderNavItem/HeaderNavItem.react';

import styles from 'components/back4App/HeaderNav/HeaderNav.scss';

class HeaderNav extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  renderHeaderMenuItems(items) {
    return items.map((item, index) => (index == 0) ?
      <HeaderNavItem key={index} index={index} {...item} notification={this.props.amountAppsWithExpiredPlans} /> :
      <HeaderNavItem key={index} index={index} {...item} />
    );
  }

  render() {
    return (
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {this.renderHeaderMenuItems(this.props.items)}
        </ul>
      </nav>
    );
  }

}

export default HeaderNav;