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
    switch (value.__type) {
      case 'Date':
        return value.iso ? new Date(value.iso).toLocaleString() : String(value);
      case 'Pointer':
        return `${value.className}:${value.objectId}`;
      case 'File':
        return value.name || 'File';
      case 'GeoPoint':
        return `(${value.latitude}, ${value.longitude})`;
      case 'Link':
        return value.text || value.url || 'Link';
      case 'Image':
        return value.alt || value.url || 'Image';
      case 'Video':
        return value.url || 'Video';
      default:
        return JSON.stringify(value);
    }
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
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value !== 'object') {
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      return String(value);
    }

    // Handle special __type objects
    switch (value.__type) {
      case 'Pointer':
        if (value.className && value.objectId) {
          return (
            <Pill
              value={value.objectId}
              onClick={() => handlePointerClick(value)}
              followClick
              shrinkablePill
            />
          );
        }
        return JSON.stringify(value);

      case 'Date':
        return value.iso ? new Date(value.iso).toLocaleString() : String(value);

      case 'File':
        return value.name || 'File';

      case 'GeoPoint':
        return `(${value.latitude}, ${value.longitude})`;

      case 'Link': {
        let url = value.url || '#';
        if (url.match(/javascript/i) || url.match(/<script/i)) {
          url = '#';
        }
        let text = value.text;
        if (!text || text.trim() === '' || text.match(/javascript/i) || text.match(/<script/i)) {
          text = 'Link';
        }
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        );
      }

      case 'Image': {
        let url = value.url;
        if (!url || url.match(/javascript/i) || url.match(/<script/i)) {
          return '-';
        }
        const width = value.width && parseInt(value.width, 10) > 0 ? parseInt(value.width, 10) : null;
        const height = value.height && parseInt(value.height, 10) > 0 ? parseInt(value.height, 10) : null;
        const imgStyle = {
          maxWidth: width ? `${width}px` : '100%',
          maxHeight: height ? `${height}px` : '100%',
          objectFit: 'contain',
          display: 'block'
        };
        return (
          <img
            src={url}
            alt={value.alt || 'Image'}
            style={imgStyle}
            onError={(e) => {
              if (e.target && e.target.style) {
                e.target.style.display = 'none';
              }
            }}
          />
        );
      }

      case 'Video': {
        let url = value.url;
        if (!url || url.match(/javascript/i) || url.match(/<script/i)) {
          return '-';
        }
        const width = value.width && parseInt(value.width, 10) > 0 ? parseInt(value.width, 10) : null;
        const height = value.height && parseInt(value.height, 10) > 0 ? parseInt(value.height, 10) : null;
        const videoStyle = {
          maxWidth: width ? `${width}px` : '100%',
          maxHeight: height ? `${height}px` : '100%',
          objectFit: 'contain',
          display: 'block'
        };
        return (
          <video
            src={url}
            controls
            style={videoStyle}
            onError={(e) => {
              if (e.target && e.target.style) {
                e.target.style.display = 'none';
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
        );
      }

      default:
        return JSON.stringify(value);
    }
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
