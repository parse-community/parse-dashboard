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

const getPositionToFitVisibleScreen = (ref) => {
  if (ref.current) {

    const elBox = ref.current.getBoundingClientRect();
    const y = (elBox.y + elBox.height) < window.innerHeight ?
      0 : (0 - elBox.y + 100);

    // If there's a previous element show current next to it.
    // Try on right side first, then on left if there's no place.
    const prevEl = ref.current.previousSibling;
    if (prevEl) {
      const prevElBox = prevEl.getBoundingClientRect();
      const showOnRight = (prevElBox.x + prevElBox.width + elBox.width) < window.innerWidth;
      return {
        x: showOnRight ? prevElBox.width : -elBox.width,
        y
      };
    }

    return { x: 0, y };
  }
};

const MenuSection = ({ level, items, path, setPath, hide }) => {

  const sectionRef = useRef(null);
  const [position, setPosition] = useState();

  useEffect(() => {
    const newPosition = getPositionToFitVisibleScreen(sectionRef);
    newPosition && setPosition(newPosition);
  }, [sectionRef]);

  const style = position ? {
    left: position.x,
    top: position.y,
    maxHeight: '80vh',
    overflowY: 'scroll',
    opacity: 1
  } : {};

  return (<ul ref={sectionRef} className={styles.category} style={style}>
    {items.map((item, index) => {
      if (item.items) {
        return (
            <li
              key={`menu-section-${level}-${index}`}
              className={styles.item}
              onMouseEnter={() => {
                const newPath = path.slice(0, level + 1);
                newPath.push(index);
                setPath(newPath);
              }}
            >
              {item.text}
            </li>
          );
      }
      return (
          <li
            key={`menu-section-${level}-${index}`}
            className={styles.option}
            onClick={() => {
              item.callback && item.callback();
              hide();
            }}
          >
            {item.text}
            {item.subtext && <span> - {item.subtext}</span>}
          </li>
        );
    })}
  </ul>);
}

let ContextMenu = ({ x, y, items }) => {

  const [path, setPath] = useState([0]);
  const [visible, setVisible] = useState(true);
  useEffect(() => { setVisible(true); }, [items]);

  const hide = () => {
    setVisible(false);
    setPath([0]);
  }

  //#region Closing menu after clicking outside it

  const menuRef = useRef(null);

  function handleClickOutside(event) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      hide();
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  //#endregion

  if (!visible) { return null; }

  const getItemsFromLevel = (level) => {
    let result = items;
    for (let index = 1; index <= level; index++) {
      result = result[path[index]].items;
    }
    return result;
  }

  return (
    <div className={styles.menu} ref={menuRef} style={{
      left: x, top: y
    }}>
      {path.map((position, level) => {
        return <MenuSection
          key={`section-${position}-${level}`}
          path={path}
          setPath={setPath}
          level={level}
          items={getItemsFromLevel(level)}
          hide={hide}
        />
      })}
    </div>
  );
}

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired.describe('X context menu position.'),
  y: PropTypes.number.isRequired.describe('Y context menu position.'),
  items: PropTypes.array.isRequired.describe('Array with tree representation of context menu items.'),
}

export default ContextMenu;
