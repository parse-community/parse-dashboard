/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes   from 'lib/PropTypes';
import AppsManager    from 'lib/AppsManager';
import AppsMenu       from 'components/Sidebar/AppsMenu.react';
import AppName        from 'components/Sidebar/AppName.react';
import FooterMenu     from 'components/Sidebar/FooterMenu.react';
import React, { useState } from 'react';
import ParseApp       from 'lib/ParseApp';
import SidebarHeader  from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles         from 'components/Sidebar/Sidebar.scss';

const Sidebar = ({
  prefix,
  action,
  actionHandler,
  children,
  subsection,
  sections,
  section,
  appSelector,
  primaryBackgroundColor,
  secondaryBackgroundColor
}, { currentApp }) => {
  const [ appsMenuOpen, setAppsMenuOpen ] = useState(false);
  const _subMenu = subsections => {
    if (!subsections) {
      return null;
    }
    return (
      <div className={styles.submenu}>
        {subsections.map(({name, link}) => {
          const active = subsection === name;
          return (
            <SidebarSubItem
              key={name}
              name={name}
              link={prefix + link}
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

  const apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));

  let sidebarContent;
  if (appsMenuOpen) {
    sidebarContent = (
      <AppsMenu
        apps={apps}
        current={currentApp}
        onSelect={() => setAppsMenuOpen(false)} />
    );
  } else {
    sidebarContent = (
      <>
        {appSelector && (
          <div className={styles.apps}>
            <AppName name={currentApp.name} onClick={() => setAppsMenuOpen(true)} />
          </div>
        )}
        <div className={styles.content}>
          {sections.map(({
            name,
            icon,
            style,
            link,
            subsections,
          }) => {
            const active = name === section;
            return (
              <SidebarSection
                key={name}
                name={name}
                icon={icon}
                style={style}
                link={prefix + link}
                active={active}
                primaryBackgroundColor={primaryBackgroundColor}
                secondaryBackgroundColor={secondaryBackgroundColor}
                >
                {active ? _subMenu(subsections) : null}
              </SidebarSection>
            );
          })}
        </div>
      </>
    )
  }

  return <div className={styles.sidebar}>
    <SidebarHeader />
    {sidebarContent}
    <div className={styles.footer}>
      <a target='_blank' href='http://parseplatform.org/'>Open Source Hub</a>
      <a target='_blank' href='https://github.com/parse-community'>GitHub</a>
      <a target='_blank' href='http://docs.parseplatform.org/'>Docs</a>
      <FooterMenu />
    </div>
  </div>
}

Sidebar.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};

export default Sidebar;
