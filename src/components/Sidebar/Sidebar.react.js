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
import Icon from 'components/Icon/Icon.react';

const isInsidePopover = node => {
  let cur = node.parentNode;
  while (cur && cur.nodeType === 1) {
    // If id starts with "fixed_wrapper", we consider it as the
    // root element of the Popover component
    if (/^fixed_wrapper/g.test(cur.id)) {
      return true;
    }
    cur = cur.parentNode;
  }
  return false;
}

let isSidebarFixed = window.innerWidth > 980;

class Sidebar extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: !isSidebarFixed,
      fixed: isSidebarFixed,
      mobileFriendly: !isSidebarFixed
    };
    this.windowResizeHandler = this.windowResizeHandler.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.windowResizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizeHandler);
    isSidebarFixed = this.state.fixed;
  }

  windowResizeHandler() {
    if (window.innerWidth <= 980) {
      if (document.body.className.indexOf(' expanded') === -1) {
        document.body.className += ' expanded';
      }
      this.setState({
        collapsed: true,
        fixed: false,
        mobileFriendly: true
      });
    } else {
      document.body.className = document.body.className.replace(' expanded', '');
      this.setState({
        collapsed: false,
        fixed: true,
        mobileFriendly: false
      });
    }
  }

  render () {
    const {
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
    } = this.props;

    const sidebarClasses = [styles.sidebar];

    if (!this.state.fixed && this.state.collapsed) {
      sidebarClasses.push(styles.collapsed);
      if (document.body.className.indexOf(' expanded') === -1) {
        document.body.className += ' expanded';
      }

      return <div className={sidebarClasses.join(' ')} onMouseEnter={!this.state.mobileFriendly && (() => this.setState({ collapsed: false }))}>
        <div className={styles.pinContainer}>
          <Icon className={styles.sidebarPin}
            name={this.state.mobileFriendly ? 'expand' : 'pin'}
            width={20}
            height={20}
            fill={this.state.mobileFriendly ? 'white' : 'lightgrey'}
            onClick={this.state.mobileFriendly && (() => this.setState({ collapsed: false }))} />
        </div>
        <div className={styles.content} style={contentStyle}>
          {sections.map(({
            name,
            icon,
            style
          }) => {
            const active = name === section;
            return (
              <SidebarSection
                key={name}
                icon={icon}
                style={style}
                active={active}
                primaryBackgroundColor={primaryBackgroundColor}
                isCollapsed={true}
                >
              </SidebarSection>
            );
          })}
        </div>
        <div className={styles.footer}>
          <Icon height={18} width={18} name='ellipses' fill='white' />
        </div>
      </div>
    }

    if (this.state.fixed) {
      document.body.className = document.body.className.replace(' expanded', '');
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

    const onMouseLeave = !this.state.mobileFriendly && !this.state.collapsed && !this.state.fixed && (
      e => {
        if (!isInsidePopover(e.relatedTarget)) {
          this.setState({ collapsed: true });
        }
      }
    );

    const pinClasses = [styles.sidebarPin];
    if (this.state.fixed) {
      pinClasses.push(styles.fixed);
    }
    let onPinClick;
    if (this.state.mobileFriendly) {
      pinClasses.push(styles.inverseIcon)
      onPinClick = () => this.setState({ collapsed: !this.state.collapsed })
    } else {
      onPinClick = () => this.setState({ collapsed: this.state.fixed, fixed: !this.state.fixed });
    }
    const pin = <Icon className={pinClasses.join(' ')} name={this.state.mobileFriendly ? 'expand' : 'pin'} width={18} height={18} onClick={onPinClick} />;

    return <div className={sidebarClasses.join(' ')} onMouseLeave={onMouseLeave}>
      {appSelector ? <AppsSelector apps={apps} pin={pin} /> : null}

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
}

Sidebar.contextTypes = {
  generatePath: React.PropTypes.func
};

export default Sidebar;
