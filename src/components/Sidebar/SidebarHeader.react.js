/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon from 'components/Icon/Icon.react';
import { Link } from 'react-router-dom';
import React from 'react';
import styles from 'components/Sidebar/Sidebar.scss';
// get the package.json environment variable
const version = process.env.version;

// Modern Parse logo — just the infinity path without the circle background
const ParseLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="20 20 60 60" fill="currentColor">
    <path d="M58.29 62.17H33.75c-3.553 0-5.658 2.172-5.658 5.396 0 2.83 1.908 5.434 4.67 5.434 3.16 0 5.04-2.776 5.238-6h7c-.33 7.763-5.066 12-12.303 12-6.776 0-11.776-4.658-11.776-11.5 0-7.105 5.33-11.5 13.225-11.5h24.342c8.224 0 14.474-6.592 14.474-14.75C72.96 33.026 67.37 27 59.41 27c-7.895 0-14.21 6.092-14.21 16.618V51H37.96v-7.382C37.96 29.538 47.04 20 59.54 20c11.973 0 20.657 8.947 20.657 21.118 0 12.237-9.342 21.053-21.908 21.053" />
  </svg>
);

// Classic Parse logo — full circle with infinity symbol
const ClassicParseLogo = ({ size = 28 }) => (
  <Icon width={size} height={size} name="infinity" fill={'#ffffff'} />
);

export default class SidebarHeader extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    const { isCollapsed = false, dashboardUser } = this.props;
    const isClassic = typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'classic';
    const Logo = isClassic ? ClassicParseLogo : ParseLogo;

    const headerContent = isCollapsed ? (
      <div className={styles.logo}>
        <Logo />
      </div>
    ) : (
      <>
        <Link className={styles.logo} to={{ pathname: '/apps' }}>
          <Logo />
        </Link>
        <Link to="/apps">
          <div className={styles.version}>
            <div>
              Parse Dashboard {version}
              <div>{dashboardUser}</div>
            </div>
          </div>
        </Link>
      </>
    );
    return <div className={styles.header}>{headerContent}</div>;
  }
}
