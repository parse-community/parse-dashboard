/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppBadge         from 'components/AppBadge/AppBadge.react';
import html             from 'lib/htmlString';
import { Link }         from 'react-router';
import React            from 'react';
import styles           from 'components/Sidebar/Sidebar.scss';
import { unselectable } from 'stylesheets/base.scss';

let AppsMenu = ({ apps, current, height, onSelect }) => (
  <div style={{ height }} className={[styles.appsMenu, unselectable].join(' ')}>
    <div className={styles.currentApp} onClick={onSelect.bind(null, current.slug)}>
      {current.name}
    </div>
    <div className={styles.menuSection}>All Apps</div>
    {apps.map((app) => {
      if (app.slug === current.slug) {
        return null;
      }
      return (
        <Link to={{ pathname: html`/apps/${app.slug}/browser` }} key={app.slug} className={styles.menuRow}>
          {app.name}
          <AppBadge production={app.production} />
        </Link>
      );
    })}
  </div>
);

export default AppsMenu;
