/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsManager from 'lib/AppsManager';
import AppsMenu from 'components/Sidebar/AppsMenu.react';
import AppName from 'components/Sidebar/AppName.react';
import isInsidePopover from 'lib/isInsidePopover';
import Pin from 'components/Sidebar/Pin.react';
import React, { useEffect, useState, useContext, useRef } from 'react';
import SidebarHeader from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles from 'components/Sidebar/Sidebar.scss';
import ThemeSelector from 'components/Sidebar/ThemeSelector.react';
import { CurrentApp } from 'context/currentApp';
import Icon from 'components/Icon/Icon.react';
const mountPath = window.PARSE_DASHBOARD_PATH;

const COLLAPSE_WIDTH = 1024;

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
  secondaryBackgroundColor,
  mobileOpen,
  onMobileClose,
}) => {
  const currentApp = useContext(CurrentApp);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= COLLAPSE_WIDTH);
  const [fixed, setFixed] = useState(window.innerWidth > COLLAPSE_WIDTH);
  const [dashboardUser, setDashboardUser] = useState('');
  const prevWidth = useRef(window.innerWidth);

  useEffect(() => {
    fetch(mountPath).then(response => {
      setDashboardUser(response.headers.get('username'));
    });
  }, []);

  const windowResizeHandler = () => {
    const w = window.innerWidth;
    if (w <= COLLAPSE_WIDTH && prevWidth.current > COLLAPSE_WIDTH) {
      document.body.classList.add('expanded');
      setCollapsed(true);
      setFixed(false);
    } else if (w > COLLAPSE_WIDTH && prevWidth.current <= COLLAPSE_WIDTH) {
      document.body.classList.remove('expanded');
      setCollapsed(false);
      setFixed(true);
    }
    prevWidth.current = w;
  };

  useEffect(() => {
    window.addEventListener('resize', windowResizeHandler);
    return () => window.removeEventListener('resize', windowResizeHandler);
  });

  const sidebarClasses = [styles.sidebar];
  if (fixed) {
    document.body.classList.remove('expanded');
  } else if (!fixed && collapsed) {
    sidebarClasses.push(styles.collapsed);
    document.body.classList.add('expanded');
  }
  if (mobileOpen) {
    sidebarClasses.push(styles.mobileOpen);
  }

  const _subMenu = subsections => {
    if (!subsections) {
      return null;
    }
    return (
      <div className={styles.submenu}>
        {subsections.map(({ name, link, icon }) => {
          const active = subsection === name;
          return (
            <SidebarSubItem
              key={name}
              name={name}
              link={prefix + link}
              action={action || null}
              actionHandler={active ? actionHandler : null}
              active={active}
              icon={icon}
              onNavigate={onMobileClose}
            >
              {active ? children : null}
            </SidebarSubItem>
          );
        })}
      </div>
    );
  };

  const onPinClick = () => {
    if (fixed) {
      setFixed(false);
      setCollapsed(true);
      setAppsMenuOpen(false);
    } else {
      setFixed(true);
      setCollapsed(false);
    }
  };

  let sidebarContent;
  if (appsMenuOpen) {
    const apps = []
      .concat(AppsManager.apps())
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    sidebarContent = (
      <AppsMenu
        apps={apps}
        current={currentApp}
        onPinClick={onPinClick}
        onSelect={() => setAppsMenuOpen(false)}
      />
    );
  } else {
    const topContent = collapsed ? (
      <Pin onClick={onPinClick} />
    ) : (
      (appSelector && (
        <div className={styles.apps}>
          <AppName
            name={currentApp.name}
            onClick={() => setAppsMenuOpen(true)}
            onPinClick={onPinClick}
          />
        </div>
      )) ||
      undefined
    );

    sidebarContent = (
      <>
        <div className={styles.content}>
          {topContent}
          {sections.map(({ name, icon, style, link, subsections }) => {
            const active = name === section;
            return (
              <SidebarSection
                key={name}
                name={collapsed ? null : name}
                icon={icon}
                style={style}
                link={prefix + link}
                active={active}
                onNavigate={onMobileClose}
              >
                {!collapsed && active ? _subMenu(subsections) : null}
              </SidebarSection>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div
      className={sidebarClasses.join(' ')}
      onMouseEnter={!fixed && collapsed ? () => setCollapsed(false) : undefined}
      onMouseLeave={
        !collapsed && !fixed
          ? e => {
            if (!isInsidePopover(e.relatedTarget)) {
              setAppsMenuOpen(false);
              setCollapsed(true);
            }
          }
          : undefined
      }
    >
      <SidebarHeader isCollapsed={!appsMenuOpen && collapsed} dashboardUser={dashboardUser} />
      {sidebarContent}
      <div className={styles.footer}>
        <ThemeSelector />
        {dashboardUser && (
          <a href={`${mountPath}logout`} className={styles.more}>
            <Icon height={16} width={16} name="logout" />
            Logout
          </a>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
