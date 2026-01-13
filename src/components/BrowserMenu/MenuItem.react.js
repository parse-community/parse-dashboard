/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/BrowserMenu/BrowserMenu.scss';

const MenuItem = ({ text, shortcut, disabled, active, greenActive, onClick, disableMouseDown = false, closeMenu }) => {
  const classes = [styles.item];
  if (disabled) {
    classes.push(styles.disabled);
  }
  if (active) {
    classes.push(styles.active);
  }
  if (greenActive) {
    classes.push(styles.greenActive);
  }

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
      // If disableMouseDown is true and we have a closeMenu function, close the menu
      if (disableMouseDown && closeMenu) {
        closeMenu();
      }
    }
  };

  return (
    <div
      className={classes.join(' ')}
      onClick={handleClick}
      onMouseDown={disableMouseDown ? undefined : handleClick} // This is needed - onClick alone doesn't work in this context
      style={{
        position: 'relative',
        zIndex: 9999,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>{text}</span>
      {shortcut && (
        <span
          style={{
            opacity: 0.5,
            fontSize: '0.85em',
            marginLeft: '12px',
            color: 'inherit'
          }}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
};

export default MenuItem;
