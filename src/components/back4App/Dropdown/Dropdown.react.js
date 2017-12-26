import React, { Component } from 'react';

import Button from 'components/back4App/Button/Button.react.js';

import styles from 'components/back4App/Dropdown/Dropdown.scss';

export default class Dropdown extends Component {

  _renderDropdownItems(items) {
    return items.map((item, index) => (
      <a key={index} className="dropdown-item" href={item.url}>{item.label}</a>
    ));
  }
  
  render() {
    return (
      <div className={`dropdown ${styles.dropdown}`}>
        <Button
          color="transparent"
          attrs={{
            "type": "button",
            "id": "dropdownMenuButton",
            "data-toggle": "dropdown",
            "aria-haspopup": "true",
            "aria-expanded": "false",
          }}
          >{this.props.children}</Button>

        <div className={`dropdown-menu ${styles['dropdown-menu']} ${styles.menu}`} aria-labelledby="dropdownMenuButton">
          <i className={`${styles['icon-caret']} zmdi zmdi-caret-up`}></i>
          {this._renderDropdownItems(this.props.items)}
        </div>
      </div>
    );
  }
}
