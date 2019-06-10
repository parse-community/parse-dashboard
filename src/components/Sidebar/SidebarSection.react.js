/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon     from 'components/Icon/Icon.react';
import { Link } from 'react-router-dom';
import React    from 'react';
import styles   from 'components/Sidebar/Sidebar.scss';

const sendEvent = () => {
  back4AppNavigation && back4AppNavigation.atApiReferenceIntroEvent && back4AppNavigation.atApiReferenceIntroEvent()
}

let SidebarSection = ({ active, children, name, link, icon, style, primaryBackgroundColor, secondaryBackgroundColor, isCollapsed, onClick, badge }) => {
  let classes = [styles.section];
  if (active) {
    classes.push(styles.active);
  }
  if (isCollapsed) {
    classes.push(styles.collapsed);
  }

  const iconContent = icon && <Icon width={25} height={25} name={icon} fill='#ffffff' />;
  const textContent = !isCollapsed && <span>{name}</span>;
  const sectionContent = active
    ? <div style={style} className={styles.section_header} style={{ background: primaryBackgroundColor}} onClick={onClick}>{iconContent}{textContent}{badge}</div>
    : link.startsWith('/')
      ? <Link style={style} className={styles.section_header} to={{ pathname: link || '' }} onClick={onClick}>{iconContent}{textContent}{badge}</Link>
      : <a style={style} className={styles.section_header} href={link} target="_blank" onClick={() => sendEvent()}>{iconContent}{textContent}{badge}</a>;
  return (
    <div className={classes.join(' ')} title={isCollapsed && name}>
      {sectionContent}
      {!isCollapsed && children && <div className={styles.section_contents} style={{ background: secondaryBackgroundColor}}>{children}</div>}
    </div>
  );
};

export default SidebarSection;
