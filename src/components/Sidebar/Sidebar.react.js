/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsManager    from 'lib/AppsManager';
import AppsSelector   from 'components/Sidebar/AppsSelector.react';
import FooterMenu from 'components/Sidebar/FooterMenu.react';
import React          from 'react';
// import SidebarHeader  from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles         from 'components/Sidebar/Sidebar.scss';
import zendeskSettings from 'components/Sidebar/zendeskSettings'
import Button from 'components/Button/Button.react'

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
  secondaryBackgroundColor,
  footerMenuButtons
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
  let footerButtons = [
    <Button value='Support'
      primary={true}
      width='75px'
      onClick={() => zE.activate()}
      key={0}
    />
  ];
  if (footerMenuButtons) {
    footerButtons.push(<FooterMenu key={1}>{footerMenuButtons}</FooterMenu>);
  }

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
    <div className={styles.footer}>{footerButtons}</div>
  </div>
}

Sidebar.contextTypes = {
  generatePath: React.PropTypes.func
};

export default Sidebar;
