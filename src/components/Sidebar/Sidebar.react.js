/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsManager    from 'lib/AppsManager';
import AppsSelector   from 'components/Sidebar/AppsSelector.react';
import React          from 'react';
// import SidebarHeader  from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles         from 'components/Sidebar/Sidebar.scss';
import zendeskSettings from 'components/Sidebar/zendeskSettings'

const Sidebar = ({
  prefix,
  action,
  actionHandler,
  children,
  subsection,
  sections,
  section,
  appSelector,
  contentStyle,
  primaryBackgroundColor,
  secondaryBackgroundColor
}) => {
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
              active={active}
              >
              {active ? children : null}
            </SidebarSubItem>
          );
        })}
      </div>
    );
  }

  const apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));

  return <div className={styles.sidebar}>
    {/*<SidebarHeader />*/}
    {appSelector ? <AppsSelector apps={apps} /> : null}

    <div className={styles.content} style={contentStyle}>
      {sections.map(({
        name,
        icon,
        style,
        link,
        subsections,
      }) => {
        const active = name === section;

        // If link points to another component, adds the prefix
        link = link.startsWith('/') ? prefix + link : link;
        return (
          <SidebarSection
            key={name}
            name={name}
            icon={icon}
            style={style}
            link={link}
            active={active}
            primaryBackgroundColor={primaryBackgroundColor}
            secondaryBackgroundColor={secondaryBackgroundColor}
            >
            {active ? _subMenu(subsections) : null}
          </SidebarSection>
        );
      })}
    </div>
    <div className={styles.help}>
      {/* div to add the zendesk help widget*/}
    </div>
    <div className={styles.footer}>
      <a target='_blank' href='http://parseplatform.org/'>Open Source Hub</a>
      <a target='_blank' href='https://github.com/parse-community'>GitHub</a>
      <a target='_blank' href='http://docs.parseplatform.org/'>Docs</a>
    </div>
  </div>
}

Sidebar.contextTypes = {
  generatePath: React.PropTypes.func
};

export default Sidebar;
