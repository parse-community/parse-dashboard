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

const getPositionToFitVisibleScreen = (ref, offset = 0) => {
  if (!ref.current) {
    return;
  }

  const elBox = ref.current.getBoundingClientRect();
  const menuHeight = elBox.height;
  const footerHeight = 50;
  const lowerLimit = window.innerHeight - footerHeight;
  const upperLimit = 0;

  const prevEl = ref.current.previousSibling;

  if (prevEl) {
    const prevElBox = prevEl.getBoundingClientRect();

    // Position relative to the immediate previous sibling (parent submenu)
    // Check if there's space to the right of the previous menu
    const spaceOnRight = window.innerWidth - prevElBox.right;
    const showOnRight = spaceOnRight >= elBox.width;

    // Calculate x offset relative to current element's position
    // to place it adjacent to the previous sibling
    const xRight = prevElBox.right - elBox.left;
    const xLeft = prevElBox.left - elBox.left - elBox.width;

    // Align submenu vertically with the hovered item in the parent menu
    // offset is the pixel position of the hovered item (index * 30px item height)
    let proposedTop = prevElBox.top + offset;

    // Clamp to screen bounds
    proposedTop = Math.max(upperLimit, Math.min(proposedTop, lowerLimit - menuHeight));

    return {
      x: showOnRight ? xRight : xLeft,
      y: proposedTop - elBox.top,
    };
  }

  const proposedTop = elBox.top + offset;
  const clampedTop = Math.max(upperLimit, Math.min(proposedTop, lowerLimit - menuHeight));
  return {
    x: 0,
    y: clampedTop - elBox.top,
  };
};

const MenuSection = ({ level, items, path, setPath, hide }) => {
  const sectionRef = useRef(null);
  const [position, setPosition] = useState(null);
  const hasPositioned = useRef(false);

  useEffect(() => {
    if (!hasPositioned.current) {
      const newPosition = getPositionToFitVisibleScreen(sectionRef, path[level] * 30);
      if (newPosition) {
        setPosition(newPosition);
        hasPositioned.current = true;
      }
    }
  }, []);

  const style = position
    ? {
      transform: `translate(${position.x}px, ${position.y}px)`,
      maxHeight: '80vh',
      overflowY: 'auto',
      opacity: 1,
      position: 'absolute',
    }
    : {};

  return (
    <ul ref={sectionRef} className={styles.category} style={style}>
      {items.map((item, index) => {
        const handleHover = () => {
          const newPath = path.slice(0, level + 1);
          newPath.push(index);
          setPath(newPath);
        };

        return (
          <li
            key={`menu-section-${level}-${index}`}
            className={item.items ? styles.item : styles.option}
            style={item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={() => {
              if (!item.disabled) {
                item.callback?.();
                hide();
              }
            }}
            onMouseEnter={handleHover}
          >
            {item.text}
            {item.subtext && <span> - {item.subtext}</span>}
          </li>
        );
      })}
    </ul>
  );
};

const ContextMenu = ({ x, y, items }) => {
  const [path, setPath] = useState([0]);
  const [visible, setVisible] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    setVisible(true);
  }, [items]);

  const hide = () => {
    setVisible(false);
    setPath([0]);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        hide();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const getItemsFromLevel = level => {
    let result = items;
    for (let i = 1; i <= level; i++) {
      result = result[path[i]]?.items || [];
    }
    return result;
  };

  return (
    <div
      className={styles.menu}
      ref={menuRef}
      style={{ left: x, top: y, position: 'absolute' }}
    >
      {path.map((_, level) => {
        const itemsForLevel = getItemsFromLevel(level);

        return (
          <MenuSection
            key={`section-${path[level]}-${level}`}
            path={path}
            setPath={setPath}
            level={level}
            items={itemsForLevel}
            hide={hide}
          />
        );
      })}
    </div>
  );
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired.describe('X context menu position.'),
  y: PropTypes.number.isRequired.describe('Y context menu position.'),
  items: PropTypes.array.isRequired.describe('Array with tree representation of context menu items.'),
};

export default ContextMenu;
