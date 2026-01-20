/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Icon from 'components/Icon/Icon.react';
import Pill from 'components/Pill/Pill.react';
import styles from './ViewElement.scss';

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'object') {
    if (value.__type === 'Date') {
      return new Date(value.iso).toLocaleString();
    }
    if (value.__type === 'Pointer') {
      return `${value.className}:${value.objectId}`;
    }
    if (value.__type === 'File') {
      return value.name;
    }
    if (value.__type === 'Link') {
      return value.text || value.url;
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
};

const ViewElement = ({
  config,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
  onPointerClick,
}) => {
  if (!config || !config.viewId) {
    return (
      <div className={styles.noConfig}>
        <Icon name="visibility" width={32} height={32} fill="#64748b" />
        <p>No view configured</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Icon name="spinner" width={24} height={24} fill="#64748b" />
        <p>Loading view data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Icon name="exclamation-triangle" width={24} height={24} fill="#ef4444" />
        <p>Error loading view data</p>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className={styles.retryButton}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.noData}>
        <Icon name="visibility" width={32} height={32} fill="#64748b" />
        <p>No data found</p>
      </div>
    );
  }

  // Get columns from data if not specified
  const displayColumns = columns || Object.keys(data[0]).filter(k => k !== 'ACL');

  const handlePointerClick = (value) => {
    if (onPointerClick && value.__type === 'Pointer' && value.className && value.objectId) {
      onPointerClick({ className: value.className, id: value.objectId });
    }
  };

  const renderCellContent = (value) => {
    if (value && typeof value === 'object' && value.__type === 'Pointer' && value.className && value.objectId) {
      return (
        <Pill
          value={value.objectId}
          onClick={() => handlePointerClick(value)}
          followClick
          shrinkablePill
        />
      );
    }
    if (value && typeof value === 'object' && value.__type === 'Link') {
      let url = value.url;
      if (url.match(/javascript/i) || url.match(/<script/i)) {
        url = '#';
      }
      const text = value.text || 'Link';
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
    }
    return formatValue(value);
  };

  return (
    <div className={styles.viewElement}>
      <div className={styles.tableHeader}>
        <span className={styles.tableTitle}>{config.title || config.viewName}</span>
        <span className={styles.rowCount}>{data.length} rows</span>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className={styles.refreshButton}>
            <Icon name="refresh-solid" width={12} height={12} fill="#94a3b8" />
          </button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {displayColumns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.objectId || i}>
                {displayColumns.map(col => {
                  const value = row[col];
                  const isPointer = value && typeof value === 'object' && value.__type === 'Pointer';
                  return (
                    <td
                      key={col}
                      title={formatValue(value)}
                      className={isPointer ? styles.pointerCell : undefined}
                    >
                      {renderCellContent(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewElement;
