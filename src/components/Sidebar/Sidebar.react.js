/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { getToken }   from 'lib/CSRFManager';
import AppsManager    from 'lib/AppsManager';
import AppsSelector   from 'components/Sidebar/AppsSelector.react';
import FooterMenu     from 'components/Sidebar/FooterMenu.react';
import getSiteDomain  from 'lib/getSiteDomain';
import React          from 'react';
import SidebarHeader  from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles         from 'components/Sidebar/Sidebar.scss';

export default class Sidebar extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }

  _subMenu(subsections) {
    let {
      prefix,
      action,
      actionHandler,
      children,
      subsection,
    } = this.props;
    if (!subsections) {
      return null;
    }
    return (
      <div className={styles.submenu}>
        {subsections.map((section) => {
          let active = subsection === section.name;
          return (
            <SidebarSubItem
              key={section.name}
              name={section.name}
              link={prefix + section.link}
              action={action || null}
              actionHandler={active ? actionHandler : null}
              active={active}>
              {active ? children : null}
            </SidebarSubItem>
          );
        })}
      </div>
    );
  }

  render() {
    let apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));

    let {
      sections,
      section,
      prefix,
      appSelector,
    } = this.props;

    return (
      <div className={styles.sidebar}>
        <SidebarHeader />
        {appSelector ? <AppsSelector apps={apps} /> : null}

        <div className={styles.content}>
          {sections.map(({
            name,
            icon,
            style,
            link,
            subsections,
          }) => {
            let active = name === section;
            return (
              <SidebarSection
                key={name}
                name={name}
                icon={icon}
                style={style}
                link={prefix + link}
                active={active}>
                {active ? this._subMenu(subsections) : null}
              </SidebarSection>
            );
          })}
        </div>
        <div className={styles.footer}>
          <a href='https://parseplatform.github.io'>Open Source</a>
          <a href='https://www.parse.com/docs'>Docs</a>
          <a href='https://www.parse.com/downloads'>Downloads</a>
          <FooterMenu />
        </div>
      </div>
    );
  }
}

Sidebar.contextTypes = {
  generatePath: React.PropTypes.func
};
