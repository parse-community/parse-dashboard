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
    // offset is the actual pixel position of the hovered item (via offsetTop)
    // Subtract parent's scrollTop to account for scrolled position
    const adjustedOffset = offset - prevEl.scrollTop;
    let proposedTop = prevElBox.top + adjustedOffset;

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

const MenuSection = ({ level, items, path, setPath, hide, hoveredItemOffset }) => {
  const sectionRef = useRef(null);
  const [position, setPosition] = useState(null);
  const basePosition = useRef(null);
  const initialParentScrollTop = useRef(0);

  useEffect(() => {
    // Use the actual pixel offset of the hovered item instead of index-based calculation
    const newPosition = getPositionToFitVisibleScreen(sectionRef, hoveredItemOffset);
    if (newPosition) {
      setPosition(newPosition);
      basePosition.current = newPosition;
      // Store the initial scroll position of the parent menu
      const prevEl = sectionRef.current?.previousSibling;
      if (prevEl) {
        initialParentScrollTop.current = prevEl.scrollTop;
      }
    }
  }, [hoveredItemOffset]);

  // Listen for scroll events on the parent menu and adjust position
  useEffect(() => {
    const prevEl = sectionRef.current?.previousSibling;
    if (!prevEl || !basePosition.current) {
      return;
    }

    const handleScroll = () => {
      // Calculate how much the parent has scrolled since the submenu was opened
      const scrollDelta = prevEl.scrollTop - initialParentScrollTop.current;
      // Adjust the Y position to follow the parent item
      setPosition({
        ...basePosition.current,
        y: basePosition.current.y - scrollDelta,
      });
    };

    prevEl.addEventListener('scroll', handleScroll);
    return () => {
      prevEl.removeEventListener('scroll', handleScroll);
    };
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
        const handleHover = (event) => {
          const newPath = path.slice(0, level + 1);
          newPath.push(index);
          // Get the actual pixel offset of the hovered item relative to its parent
          const itemElement = event.currentTarget;
          const itemOffset = itemElement.offsetTop;
          setPath(newPath, itemOffset);
        };

        // Handle separator items
        if (item.type === 'separator') {
          return (
            <li
              key={`menu-section-${level}-${index}`}
              className={styles.separator}
            />
          );
        }

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

const ContextMenu = ({ x, y, items, onHide }) => {
  const [path, setPath] = useState([0]);
  // Track the pixel offset of the hovered item for each level
  const [hoveredOffsets, setHoveredOffsets] = useState([0]);
  const [visible, setVisible] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    setVisible(true);
  }, [items]);

  const hide = () => {
    setVisible(false);
    setPath([0]);
    setHoveredOffsets([0]);
    onHide?.();
  };

  // Combined setter that updates both path and offsets
  const updatePath = (newPath, itemOffset) => {
    setPath(newPath);
    // Update offsets array to match the new path length
    const newOffsets = hoveredOffsets.slice(0, newPath.length - 1);
    newOffsets.push(itemOffset);
    setHoveredOffsets(newOffsets);
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
            setPath={updatePath}
            level={level}
            items={itemsForLevel}
            hide={hide}
            hoveredItemOffset={hoveredOffsets[level] || 0}
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
  onHide: PropTypes.func.describe('Callback when context menu is hidden.'),
};

export default ContextMenu;
