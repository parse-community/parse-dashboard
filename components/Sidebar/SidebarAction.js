import React  from 'react';
import styles from 'components/Sidebar/Sidebar.scss';

export default class SidebarAction {
  constructor(text, fn) {
    this.text = text;
    this.fn = fn;
  }

  renderButton() {
    return (
      <a
        className={styles.action}
        onClick={this.fn || function() {}}>
        {this.text}
      </a>
    );
  }
}
