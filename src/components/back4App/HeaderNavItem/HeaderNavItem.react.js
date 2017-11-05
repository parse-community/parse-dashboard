import React from 'react';

import styles from 'components/back4App/HeaderNavItem/HeaderNavItem.scss';

let NavItem = props => (
  <li className={styles.item}>
    <a className={styles.label} href={props.url}>{props.label}</a>
    <i className={`${styles.icon} zmdi zmdi-caret-up`}></i>
  </li>
);

const _renderDropdownItems = items => items.map((item, index) => (
  <a key={index}className="dropdown-item" href={item.url}>{item.label}</a>
));

let DropdownItem = props => {
  return (
    <li className={styles.item}>
      <div className="dropdown">
        <button type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{props.label}
          <i className="dropdown-icon zmdi zmdi-caret-down"></i>
        </button>
        <i className="icon zmdi zmdi-caret-up"></i>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {_renderDropdownItems(props.items)}
        </div>
      </div>
    </li>
  );
}

let HeaderNavItem = props => props.url ? NavItem(props) : DropdownItem(props);

export default HeaderNavItem;
