import React from 'react';

import styles from 'components/back4App/HeaderNav/HeaderNav.scss';

export default () => (
  <nav className={styles.nav}>
    <ul className={styles.menu}>
      <li className={styles.item}>
        <a href="/">Home</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className="item">
        <div className="dropdown">
          <button type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Product
            <i className="dropdown-icon zmdi zmdi-caret-down"></i>
          </button>
          <i className="icon zmdi zmdi-caret-up"></i>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a className="dropdown-item" href="/product/parse-server">Parse Server</a>
            <a className="dropdown-item" href="/product/addons">Add-ons</a>
            <a className="dropdown-item" href="/product/hosting">Hosting</a>
            <a className="dropdown-item" href="/product/push-notifications">Push Notifications</a>
          </div>
        </div>
      </li>
      <li className={styles.item}>
        <a href="/pricing">Pricing</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className={styles.item}>
        <a href="http://docs.back4app.com/">Docs</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className={styles.item}>
        <a href="https://groups.google.com/forum/#!forum/back4app">Community</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className={styles.item}>
        <a href="http://blog.back4app.com/">Blog</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className={styles.item}>
        <a href="/faq">FAQ</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
      <li className={styles.item}>
        <a href="/about-us">About us</a>
        <i className="icon zmdi zmdi-caret-up"></i>
      </li>
    </ul>
  </nav>
);
