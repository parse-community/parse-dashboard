/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState } from 'react';
import Icon from 'components/Icon/Icon.react';
import ExpandModal from './ExpandModal.react';
import styles from './DataTableElement.scss';

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
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
};

const DataTableElement = ({
  config,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!config || !config.className) {
    return (
      <div className={styles.noConfig}>
        <Icon name="table" width={32} height={32} fill="#64748b" />
        <p>No data table configured</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Icon name="spinner" width={24} height={24} fill="#64748b" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Icon name="exclamation-triangle" width={24} height={24} fill="#ef4444" />
        <p>Error loading data</p>
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
        <Icon name="table" width={32} height={32} fill="#64748b" />
        <p>No data found</p>
      </div>
    );
  }

  const displayColumns = (
    config.columns ||
    (columns ? Object.keys(columns) : Object.keys(data[0]))
  ).filter(k => k !== 'ACL');

  const title = config.title || config.className;

  const renderTable = () => (
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
            {displayColumns.map(col => (
              <td key={col} title={formatValue(row[col])}>
                {formatValue(row[col])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.dataTableElement}>
      <div className={styles.tableHeader}>
        <span className={styles.tableTitle}>{title}</span>
        <span className={styles.rowCount}>{data.length} rows</span>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={styles.expandButton}
          title="Expand"
        >
          <Icon name="expand-outline" width={12} height={12} fill="#94a3b8" />
        </button>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className={styles.refreshButton}>
            <Icon name="refresh-solid" width={12} height={12} fill="#94a3b8" />
          </button>
        )}
      </div>
      <div className={styles.tableContainer}>
        {renderTable()}
      </div>
      {isExpanded && (
        <ExpandModal title={title} onClose={() => setIsExpanded(false)}>
          <div className={styles.expandedTableContainer}>
            {renderTable()}
          </div>
        </ExpandModal>
      )}
    </div>
  );
};

export default DataTableElement;
