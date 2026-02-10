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

    this.state = { open: false, openToLeft: false, openChildKey: null, closeAllTrigger: 0 };
    this.wrapRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    // Close if shouldClose changed to true (sibling submenu opened),
    // OR if closeAllTrigger incremented (MenuItem was hovered)
    const shouldCloseChanged = this.props.shouldClose && !prevProps.shouldClose;
    const closeAllTriggered = this.props.closeAllTrigger !== undefined &&
                               prevProps.closeAllTrigger !== undefined &&
                               this.props.closeAllTrigger !== prevProps.closeAllTrigger;
    if ((shouldCloseChanged || closeAllTriggered) && this.state.open) {
      this.setState({ open: false });
    }
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
                // Only apply minWidth for top-level menus, not submenus
                ...(isSubmenu
                  ? (() => {
                    // Find the parent menu container to get its width for proper positioning
                    const parentMenuBody = this.wrapRef.current.closest(`.${styles.subMenuBody}`) ||
                                           this.wrapRef.current.closest(`.${styles.subMenuBodyLeft}`) ||
                                           this.wrapRef.current.closest(`.${styles.body}`);
                    const parentWidth = parentMenuBody ? parentMenuBody.clientWidth : this.wrapRef.current.clientWidth;
                    return {
                      top: 0,
                      left: this.state.openToLeft
                        ? 0
                        : `${parentWidth - 3}px`,
                      transform: this.state.openToLeft
                        ? 'translateX(calc(-100% + 3px))'
                        : undefined,
                    };
                  })()
                  : { minWidth: this.wrapRef.current.clientWidth }),
              }}
            >
              {React.Children.map(this.props.children, (child, index) => {
                if (React.isValidElement(child)) {
                  if (child.type === BrowserMenu) {
                    const childKey = `submenu-${index}`;
                    const shouldClose = this.state.openChildKey !== null && this.state.openChildKey !== childKey;
                    return React.cloneElement(child, {
                      ...child.props,
                      parentClose: () => {
                        this.setState({ open: false });
                        this.props.parentClose?.();
                      },
                      childKey,
                      shouldClose,
                      closeAllTrigger: this.state.closeAllTrigger,
                      onSubmenuOpen: (key) => this.setState({ openChildKey: key }),
                    });
                  }
                  // Pass closeMenu and onItemHover props to all other children (like MenuItem)
                  return React.cloneElement(child, {
                    ...child.props,
                    closeMenu: () => {
                      this.setState({ open: false });
                      this.props.parentClose?.();
                    },
                    onItemHover: () => {
                      this.setState(prev => ({
                        openChildKey: null,
                        closeAllTrigger: prev.closeAllTrigger + 1,
                      }));
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
          // Find the parent menu container to get its right edge for proper positioning
          const parentMenuBody = this.wrapRef.current.closest(`.${styles.subMenuBody}`) ||
                                 this.wrapRef.current.closest(`.${styles.subMenuBodyLeft}`) ||
                                 this.wrapRef.current.closest(`.${styles.body}`);
          const parentRect = parentMenuBody ? parentMenuBody.getBoundingClientRect() : this.wrapRef.current.getBoundingClientRect();
          const estimatedSubmenuWidth = 150; // Estimate for edge detection
          const openToLeft = parentRect.right + estimatedSubmenuWidth > window.innerWidth;
          this.setState({ open: true, openToLeft });
          // Notify parent that this submenu is now open (to close sibling submenus)
          this.props.onSubmenuOpen?.(this.props.childKey);
        };
      } else {
        entryEvents.onClick = () => {
          this.setState({ open: true, openToLeft: false });
        };
      }
    }
    const wrapEvents = {};
    if (isSubmenu && !this.props.disabled) {
      wrapEvents.onMouseLeave = (event) => {
        // Only close submenu if mouse is moving to a sibling item in the parent menu
        // Don't close if moving outside the menu entirely
        const relatedTarget = event.relatedTarget;
        if (!relatedTarget) {
          return;
        }
        // Find the parent menu body that contains this submenu
        const parentMenuBody = this.wrapRef.current.closest(`.${styles.subMenuBody}`) ||
                               this.wrapRef.current.closest(`.${styles.subMenuBodyLeft}`) ||
                               this.wrapRef.current.closest(`.${styles.body}`);
        // Check if mouse is moving to another item in the same parent menu (sibling)
        const isMovingToSibling = parentMenuBody &&
                                  parentMenuBody.contains(relatedTarget) &&
                                  !this.wrapRef.current.contains(relatedTarget);
        if (isMovingToSibling) {
          this.setState({ open: false });
        }
      };
    }
    return (
      <div className={styles.wrap} ref={this.wrapRef} {...wrapEvents}>
        <div className={classes.join(' ')} {...entryEvents}>
          {this.props.icon && <Icon name={this.props.icon} width={14} height={14} />}
          <span>{this.props.title}</span>
          {isSubmenu && this.props.children && (
            <span className={styles.submenuArrow} />
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
