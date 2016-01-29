import AppBadge         from 'components/AppBadge/AppBadge.react';
import html             from 'lib/htmlString';
import { Link }         from 'react-router';
import React            from 'react';
import styles           from 'components/Sidebar/Sidebar.scss';
import { unselectable } from 'stylesheets/base.scss';

let AppsMenu = ({ apps, current, height, onSelect, showCreateDialog }) => (
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
        <Link to={html`/apps/${app.slug}/browser`} key={app.slug} className={styles.menuRow}>
          {app.name}
          <AppBadge production={app.production} />
        </Link>
      );
    })}

    <a onClick={showCreateDialog} className={styles.createApp}>Create a new app</a>
  </div>
);

export default AppsMenu;
