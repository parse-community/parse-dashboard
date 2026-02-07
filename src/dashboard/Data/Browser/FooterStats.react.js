/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import styles from './FooterStats.scss';

const POPOVER_CONTENT_ID = 'footerStatsPopover';

const formatNumber = (value, isCount = false) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '–';
  }
  if (isCount) {
    return value.toLocaleString();
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const statsOptions = [
  {
    type: 'sum',
    label: 'Sum',
    getValue: data => data.reduce((sum, value) => sum + value, 0),
  },
  {
    type: 'mean',
    label: 'Mean',
    getValue: data => data.reduce((sum, value) => sum + value, 0) / data.length,
  },
  {
    type: 'count',
    label: 'Count',
    getValue: data => data.length,
    isCount: true,
  },
  {
    type: 'min',
    label: 'Min',
    getValue: data => Math.min(...data),
  },
  {
    type: 'max',
    label: 'Max',
    getValue: data => Math.max(...data),
  },
  {
    type: 'p99',
    label: 'P99',
    getValue: data => {
      const sorted = [...data].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length * 0.99)];
    },
  },
];

const STORAGE_KEY = 'parse_dashboard_footer_stats_type';

const getInitialSelection = () => {
  try {
    const savedType = localStorage.getItem(STORAGE_KEY);
    if (savedType) {
      const found = statsOptions.find(opt => opt.type === savedType);
      if (found) {
        return found;
      }
    }
  } catch {
    console.warn('Could not read from localStorage');
  }
  return statsOptions[0];
};

const FooterStats = ({ data }) => {
  const [selected, setSelected] = React.useState(getInitialSelection);
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef();

  const toggle = () => {
    setOpen(!open);
  };

  const renderPopover = () => {
    const node = buttonRef.current;
    const position = Position.inDocument(node);
    return (
      <Popover
        fixed={true}
        position={position}
        onExternalClick={toggle}
        contentId={POPOVER_CONTENT_ID}
      >
        <div id={POPOVER_CONTENT_ID} className={styles.popover_wrapper}>
          <div className={styles.stats_popover_container}>
            {statsOptions.map(item => {
              const itemStyle = [styles.stats_popover_item];
              if (item.type === selected?.type) {
                itemStyle.push(styles.active);
              }
              const value = item.getValue(data);
              return (
                <div
                  key={item.type}
                  className={itemStyle.join(' ')}
                  onClick={() => {
                    setSelected(item);
                    try {
                      localStorage.setItem(STORAGE_KEY, item.type);
                    } catch {
                      console.warn('Could not save to localStorage');
                    }
                    toggle();
                  }}
                >
                  <span className={styles.stats_label}>{item.label}</span>
                  <span className={styles.stats_value}>{formatNumber(value, item.isCount)}</span>
                </div>
              );
            })}
          </div>
          <div
            onClick={toggle}
            style={{
              cursor: 'pointer',
              width: node.clientWidth,
              height: node.clientHeight,
            }}
          ></div>
        </div>
      </Popover>
    );
  };

  if (!selected) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.stats}
        onClick={toggle}
      >
        {`${selected.label}: ${formatNumber(selected.getValue(data), selected.isCount)}`}
      </button>
      {open ? renderPopover() : null}
    </>
  );
};

export default FooterStats;
