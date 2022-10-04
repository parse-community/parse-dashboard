/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppBadge         from 'components/AppBadge/AppBadge.react';
import AppName          from 'components/Sidebar/AppName.react';
import html             from 'lib/htmlString';
import { Link }         from 'react-router-dom';
import React            from 'react';
import styles           from 'components/Sidebar/Sidebar.scss';
import baseStyles       from 'stylesheets/base.scss';

const AppsMenu = ({ apps, current, height, onSelect, onPinClick }) => (
  <div style={{ height }} className={[styles.appsMenu, baseStyles.unselectable].join(' ')}>
    <AppName name={current.name} onClick={onSelect.bind(null, current.slug)} onPinClick={onPinClick} />
    <div className={styles.menuSection}>All Apps</div>
    <div className={styles.appListContainer}>
      {apps.map((app) => {
        if (app.slug === current.slug) {
          return null;
        }
        return (
          <Link to={html`/apps/${app.slug}/browser`} key={app.slug} className={styles.menuRow} onClick={onSelect.bind(null, current.slug)}>
            <span>{app.name}</span>
            <AppBadge production={app.production} />
          </Link>
        );
      })}
    </div>
  </div>
);

export default AppsMenu;
