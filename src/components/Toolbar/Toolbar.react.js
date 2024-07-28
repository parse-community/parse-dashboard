/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React, { useEffect } from 'react';
import Icon from 'components/Icon/Icon.react';
import styles from 'components/Toolbar/Toolbar.scss';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import { useNavigate, useNavigationType, NavigationType } from 'react-router-dom';

const POPOVER_CONTENT_ID = 'toolbarStatsPopover';

const Stats = ({ data }) => {
  const [selected, setSelected] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef();

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
    },
    {
      type: 'p99',
      label: 'P99',
      getValue: data => {
        const sorted = data.sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.99)];
      },
    },
  ];

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
        <div id={POPOVER_CONTENT_ID}>
          <div
            onClick={toggle}
            style={{
              cursor: 'pointer',
              width: node.clientWidth,
              height: node.clientHeight,
            }}
          ></div>
          <div className={styles.stats_popover_container}>
            {statsOptions.map(item => {
              const itemStyle = [styles.stats_popover_item];
              if (item.type === selected?.type) {
                itemStyle.push(styles.active);
              }
              return (
                <div
                  key={item.type}
                  className={itemStyle.join(' ')}
                  onClick={() => {
                    setSelected(item);
                    toggle();
                  }}
                >
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Popover>
    );
  };

  useEffect(() => {
    setSelected(statsOptions[0]);
  }, []);

  return (
    <>
      {selected ? (
        <button ref={buttonRef} className={styles.stats} onClick={toggle}>
          {`${selected.label}: ${selected.getValue(data)}`}
        </button>
      ) : null}
      {open ? renderPopover() : null}
    </>
  );
};

const Toolbar = props => {
  const action = useNavigationType();
  const navigate = useNavigate();
  let backButton;
  if (props.relation || (props.filters && props.filters.size && action !== NavigationType.Pop)) {
    backButton = (
      <a className={styles.iconButton} onClick={() => navigate(-1)}>
        <Icon width={32} height={32} fill="#ffffff" name="left-outline" />
      </a>
    );
  }
  return (
    <div className={styles.toolbar}>
      <div className={styles.title}>
        <div className={styles.nav}>{backButton}</div>
        <div className={styles.titleText}>
          <div className={styles.section}>{props.section}</div>
          <div>
            <span className={styles.subsection}>{props.subsection}</span>
            <span className={styles.details}>{props.details}</span>
          </div>
        </div>
      </div>
      {props?.selectedData?.length ? <Stats data={props.selectedData} /> : null}
      <div className={styles.actions}>{props.children}</div>
      {props.classwiseCloudFunctions && props.classwiseCloudFunctions[props.className] && <button
        onClick={props.togglePanel}
        style={{
          position: 'absolute',
          right: '5px',
          bottom: '5px',
          border: 'none',
          padding: '4px 3px',
          width:' 100px',
          background: 'rgb(114, 111, 133)',
          color: 'white'
        }}
      >
        {props.isPanelVisible ? 'Hide Panel' : 'Show Panel'}
      </button>}
    </div>
  );
};

Toolbar.propTypes = {
  section: PropTypes.string,
  subsection: PropTypes.string,
  details: PropTypes.string,
  relation: PropTypes.object,
  selectedData: PropTypes.array,
};

export default Toolbar;
