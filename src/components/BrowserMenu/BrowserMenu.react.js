/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import styles from 'components/BrowserMenu/BrowserMenu.scss';
import Icon from 'components/Icon/Icon.react';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import PropTypes from 'lib/PropTypes';
import React from 'react';

export default class BrowserMenu extends React.Component {
  constructor() {
    super();

    this.state = { open: false, openToLeft: false };
    this.wrapRef = React.createRef();
  }

  render() {
    let menu = null;
    const isSubmenu = !!this.props.parentClose;
    if (this.state.open) {
      const position = Position.inDocument(this.wrapRef.current);
      const titleStyle = [styles.title];
      if (this.props.active) {
        titleStyle.push(styles.active);
      }
      menu = (
        <Popover
          fixed={true}
          position={position}
          onExternalClick={() => this.setState({ open: false })}
        >
          <div className={styles.menu}>
            {!isSubmenu && (
              <div
                className={titleStyle.join(' ')}
                onClick={() => this.setState({ open: false })}
              >
                {this.props.icon && <Icon name={this.props.icon} width={14} height={14} />}
                <span>{this.props.title}</span>
              </div>
            )}
            <div
              className={
                isSubmenu
                  ? this.state.openToLeft
                    ? styles.subMenuBodyLeft
                    : styles.subMenuBody
                  : styles.body
              }
              style={{
                minWidth: this.wrapRef.current.clientWidth,
                ...(isSubmenu
                  ? {
                    top: 0,
                    left: this.state.openToLeft
                      ? 0
                      : `${this.wrapRef.current.clientWidth - 3}px`,
                    transform: this.state.openToLeft
                      ? 'translateX(calc(-100% + 3px))'
                      : undefined,
                  }
                  : {}),
              }}
            >
              {React.Children.map(this.props.children, (child) => {
                if (React.isValidElement(child) && child.type === BrowserMenu) {
                  return React.cloneElement(child, {
                    ...child.props,
                    parentClose: () => {
                      this.setState({ open: false });
                      this.props.parentClose?.();
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        </Popover>
      );
    }
    const classes = [styles.entry];
    if (this.props.active) {
      classes.push(styles.active);
    }
    if (this.props.disabled) {
      classes.push(styles.disabled);
    }
    const entryEvents = {};
    if (!this.props.disabled) {
      if (isSubmenu) {
        entryEvents.onMouseEnter = () => {
          const rect = this.wrapRef.current.getBoundingClientRect();
          const width = this.wrapRef.current.clientWidth;
          const openToLeft = rect.right + width > window.innerWidth;
          this.setState({ open: true, openToLeft });
          this.props.setCurrent?.(null);
        };
      } else {
        entryEvents.onClick = () => {
          this.setState({ open: true, openToLeft: false });
          this.props.setCurrent(null);
        };
      }
    }
    return (
      <div className={styles.wrap} ref={this.wrapRef}>
        <div className={classes.join(' ')} {...entryEvents}>
          {this.props.icon && <Icon name={this.props.icon} width={14} height={14} />}
          <span>{this.props.title}</span>
          {isSubmenu &&
            React.Children.toArray(this.props.children).some(c => React.isValidElement(c) && c.type === BrowserMenu) && (
            <Icon
              name="right-outline"
              width={12}
              height={12}
              className={styles.submenuArrow}
            />
          )}
        </div>
        {menu}
      </div>
    );
  }
}

BrowserMenu.propTypes = {
  icon: PropTypes.string.describe('The name of the icon to place in the menu.'),
  title: PropTypes.string.isRequired.describe('The title text of the menu.'),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).describe(
    'The contents of the menu when open. It should be a set of MenuItem and Separator components.'
  ),
  parentClose: PropTypes.func.describe(
    'Closes the parent menu when a nested menu item is selected.'
  ),
};
