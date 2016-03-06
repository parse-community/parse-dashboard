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
    if (!subsections) {
      return null;
    }
    return (
      <div className={styles.submenu}>
        {subsections.map((section) => {
          let active = this.props.subsection === section.name;
          return (
            <SidebarSubItem
              key={section.name}
              name={section.name}
              link={this.props.prefix + section.link}
              action={this.props.action || null}
              actionHandler={active ? this.props.actionHandler : null}
              active={active}>
              {active ? this.props.children : null}
            </SidebarSubItem>
          );
        })}
      </div>
    );
  }

  render() {
    let apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));

    return (
      <div className={styles.sidebar}>
        <SidebarHeader />
        {this.props.appSelector ? <AppsSelector apps={apps} /> : null}

        <div className={styles.content}>
          {this.props.sections.map((section) => {
            let active = section.name === this.props.section;
            return (
              <SidebarSection
                key={section.name}
                name={section.name}
                icon={section.icon}
                style={section.style}
                link={this.props.prefix + section.link}
                active={active}>
                {active ? this._subMenu(section.subsections) : null}
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
