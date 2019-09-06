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
import isInsidePopover from 'lib/isInsidePopover';
import ParseApp       from 'lib/ParseApp';
import Pin            from 'components/Sidebar/Pin.react';
import React, { useEffect, useState } from 'react';
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
  const isSidebarFixed = window.innerWidth > 980;
  const [ appsMenuOpen, setAppsMenuOpen ] = useState(false);
  const [ collapsed, setCollapsed ] = useState(!isSidebarFixed);
  const [ fixed, setFixed ] = useState(isSidebarFixed);

  const windowResizeHandler = () => {
    if (window.innerWidth <= 980) {
      if (document.body.className.indexOf(' expanded') === -1) {
        document.body.className += ' expanded';
      }
      setCollapsed(true);
      setFixed(false);
    } else {
      document.body.className = document.body.className.replace(' expanded', '');
      setCollapsed(false);
      setFixed(true);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', windowResizeHandler);

    return () => {
      window.removeEventListener('resize', windowResizeHandler);
    }
  });

  const sidebarClasses = [styles.sidebar];
  if (fixed) {
    document.body.className = document.body.className.replace(' expanded', '');
  } else if (!fixed && collapsed) {
    sidebarClasses.push(styles.collapsed);
    if (document.body.className.indexOf(' expanded') === -1) {
      document.body.className += ' expanded';
    }
  }

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

  const onPinClick = () => {
    if (fixed) {
      setCollapsed(true);
      setFixed(false);
      setAppsMenuOpen(false);
    } else {
      setCollapsed(false);
      setFixed(true);
    }
  };

  let sidebarContent;
  if (appsMenuOpen) {
    const apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));
    sidebarContent = (
      <AppsMenu
        apps={apps}
        current={currentApp}
        onPinClick={onPinClick}
        onSelect={() => setAppsMenuOpen(false)} />
    );
  } else {
    const topContent = collapsed
      ? <Pin />
      : appSelector && (
        <div className={styles.apps}>
          <AppName name={currentApp.name} onClick={() => setAppsMenuOpen(true)} onPinClick={onPinClick} />
        </div>
      ) || undefined;

    sidebarContent = (
      <>
        <div className={styles.content}>
          {topContent}
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
                name={collapsed ? null : name}
                icon={icon}
                style={style}
                link={prefix + link}
                active={active}
                primaryBackgroundColor={primaryBackgroundColor}
                secondaryBackgroundColor={secondaryBackgroundColor}
                >
                {!collapsed && active ? _subMenu(subsections) : null}
              </SidebarSection>
            );
          })}
        </div>
      </>
    )
  }

  return (
    <div
      className={sidebarClasses.join(' ')}
      onMouseEnter={
        !fixed && collapsed
          ? () => setCollapsed(false)
          : undefined
      }
      onMouseLeave={
        !collapsed && !fixed
          ? (e => {
            if (!isInsidePopover(e.relatedTarget)) {
              setAppsMenuOpen(false);
              setCollapsed(true);
            }
          })
          : undefined
      }
    >
      <SidebarHeader isCollapsed={!appsMenuOpen && collapsed} />
      {sidebarContent}
      <div className={styles.footer}>
        {!collapsed && (
          <>
            <a target='_blank' href='http://parseplatform.org/'>Open Source Hub</a>
            <a target='_blank' href='https://github.com/parse-community'>GitHub</a>
            <a target='_blank' href='http://docs.parseplatform.org/'>Docs</a>
          </>
        )}
        <FooterMenu isCollapsed={!appsMenuOpen && collapsed} />
      </div>
    </div>
  );
}

Sidebar.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};

export default Sidebar;
