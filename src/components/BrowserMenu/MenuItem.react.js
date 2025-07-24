/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/BrowserMenu/BrowserMenu.scss';

const MenuItem = ({ text, disabled, active, greenActive, onClick }) => {
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
    }
  };

  return (
    <div
      className={classes.join(' ')}
      onClick={handleClick}
      onMouseDown={handleClick} // This is needed - onClick alone doesn't work in this context
      style={{
        position: 'relative',
        zIndex: 9999,
        cursor: 'pointer'
      }}
    >
      {text}
    </div>
  );
};

export default MenuItem;
