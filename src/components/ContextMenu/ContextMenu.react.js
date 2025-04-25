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

const getPositionToFitVisibleScreen = (ref, offset = 0, mainItemCount = 0, subItemCount = 0) => {
  if (ref.current) {
    const elBox = ref.current.getBoundingClientRect();
    let y = 0;

    const footerHeight = 50;
    const lowerLimit = window.innerHeight - footerHeight;
    const upperLimit = 0;

    if (elBox.bottom > lowerLimit) {
      y = lowerLimit - elBox.bottom;
    } else if (elBox.top < upperLimit) {
      y = upperLimit - elBox.top;
    }

    const projectedTop = elBox.top + y + offset;
    const projectedBottom = projectedTop + elBox.height;

    const shouldApplyOffset = subItemCount > mainItemCount;
    if (shouldApplyOffset && projectedTop >= upperLimit && projectedBottom <= lowerLimit) {
      y += offset;
    }

    const prevEl = ref.current.previousSibling;
    if (prevEl) {
      const prevElBox = prevEl.getBoundingClientRect();
      const prevElStyle = window.getComputedStyle(prevEl);
      const prevElTop = parseInt(prevElStyle.top, 10);

      if (!shouldApplyOffset) {
        y = prevElTop + offset;
      }

      const showOnRight = prevElBox.x + prevElBox.width + elBox.width < window.innerWidth;
      return {
        x: showOnRight ? prevElBox.width : -elBox.width,
        y
      };
    }

    return { x: 0, y };
  }
};

const MenuSection = ({ level, items, path, setPath, hide, parentItemCount = 0 }) => {
  const sectionRef = useRef(null);
  const [position, setPosition] = useState();

  useEffect(() => {
    const newPosition = getPositionToFitVisibleScreen(
      sectionRef,
      path[level] * 30,
      parentItemCount,
      items.length
    );
    newPosition && setPosition(newPosition);
  }, [sectionRef]);

  const style = position
    ? {
      left: position.x,
      top: position.y,
      maxHeight: '80vh',
      overflowY: 'scroll',
      opacity: 1,
    }
    : {};

  return (
    <ul ref={sectionRef} className={styles.category} style={style}>
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
            style={item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={() => {
              if (item.disabled === true) {
                return;
              }
              item.callback && item.callback();
              hide();
            }}
            onMouseEnter={() => {
              const newPath = path.slice(0, level + 1);
              setPath(newPath);
            }}
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

  if (!visible) {
    return null;
  }

  const getItemsFromLevel = level => {
    let result = items;
    for (let index = 1; index <= level; index++) {
      result = result[path[index]].items;
    }
    return result;
  };

  return (
    <div
      className={styles.menu}
      ref={menuRef}
      style={{
        left: x,
        top: y,
      }}
    >
      {path.map((position, level) => {
        const itemsForLevel = getItemsFromLevel(level);
        const parentItemCount =
          level === 0 ? items.length : getItemsFromLevel(level - 1).length;

        return (
          <MenuSection
            key={`section-${position}-${level}`}
            path={path}
            setPath={setPath}
            level={level}
            items={itemsForLevel}
            hide={hide}
            parentItemCount={parentItemCount}
          />
        );
      })}
    </div>
  );
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired.describe('X context menu position.'),
  y: PropTypes.number.isRequired.describe('Y context menu position.'),
  items: PropTypes.array.isRequired.describe(
    'Array with tree representation of context menu items.'
  ),
};

export default ContextMenu;
