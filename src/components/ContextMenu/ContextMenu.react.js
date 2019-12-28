/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React, { useState, useEffect, useRef } from 'react';
import styles from 'components/ContextMenu/ContextMenu.scss';

let ContextMenu = ({ x, y, items }) => {

  const [path, setPath] = useState([]);
  const [visible, setVisible] = useState(true);
  useEffect(() => { setVisible(true); }, [items]);

  //#region Closing menu after clicking outside it

  const menuRef = useRef(null);

  function handleClickOutside(event) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setVisible(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  //#endregion

  const renderItem = (item, index, array, level = 0) => {

    // items array indicates that we're dealing with the category
    if (item.items && item.items.length > 0) {
      return (
        <ul className={styles.category}>
          <li className={styles.item} onMouseEnter={() => {
            const newPath = path.slice(0, level);
            newPath.push(index);
            setPath(newPath);
          }}>
            {item.text}
          </li>
          {index === path[level] && <ul className={styles.body} >
            {item.items.map((a, b, c) => renderItem(a, b, c, level + 1))}
          </ul>}
        </ul>
      );
    }

    return (
      <li className={styles.option} onClick={() => {
        item.callback && item.callback();
        setVisible(false);
      }}>
        {item.text}
      </li>
    );
  }

  if (!visible) { return null; }

  return (
    <div className={styles.menu} ref={menuRef} style={{
      left: x, top: y
    }}>
      {items.map(renderItem)}
    </div>
  );
}

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired.describe('X context menu position.'),
  y: PropTypes.number.isRequired.describe('Y context menu position.'),
  items: PropTypes.array.isRequired.describe('Array with tree representation of context menu items.'),
}

export default ContextMenu;
