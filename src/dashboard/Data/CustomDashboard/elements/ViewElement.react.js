/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useMemo, useState } from 'react';
import Icon from 'components/Icon/Icon.react';
import Pill from 'components/Pill/Pill.react';
import ExpandModal from './ExpandModal.react';
import styles from './ViewElement.scss';

// Check if a URL uses a safe protocol (http: or https:)
const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Compute text width using canvas measurement
const computeTextWidth = (text) => {
  let str = text;
  if (str === undefined || str === null) {
    str = '';
  } else if (typeof str === 'object') {
    if (str.__type === 'Date' && str.iso) {
      str = new Date(str.iso).toLocaleString();
    } else if (str.__type === 'Link' && str.text) {
      str = str.text;
    } else if (str.__type === 'Pointer' && str.objectId) {
      str = str.objectId;
    } else if (str.__type === 'File' && str.name) {
      str = str.name;
    } else if (str.__type === 'GeoPoint') {
      str = `(${str.latitude}, ${str.longitude})`;
    } else if (str.__type === 'Image' || str.__type === 'Video') {
      // Use specified width if available, otherwise default min width
      const specifiedWidth = str.width && parseInt(str.width, 10) > 0 ? parseInt(str.width, 10) : null;
      // Add padding (24px) to account for cell padding
      return specifiedWidth ? specifiedWidth + 24 : 124;
    } else {
      str = JSON.stringify(str);
    }
  }
  str = String(str);

  if (typeof document !== 'undefined') {
    const canvas = computeTextWidth._canvas || (computeTextWidth._canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = '12px "Source Code Pro", "Courier New", monospace';
    const width = context.measureText(str).width + 32; // Add padding
    return Math.max(width, 60); // Minimum 60px
  }
  return Math.max((str.length + 2) * 8, 60);
};

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
  // All hooks must be called before any early returns (React Rules of Hooks)
  const displayColumns = useMemo(() => {
    return columns || Object.keys(data?.[0] || {}).filter(k => k !== 'ACL');
  }, [columns, data]);

  const columnWidths = useMemo(() => {
    if (!data || data.length === 0) {
      return {};
    }
    const widths = {};
    const maxWidth = 250; // Maximum column width

    displayColumns.forEach(col => {
      // Start with header width
      widths[col] = Math.min(computeTextWidth(col), maxWidth);
    });

    // Check each row's cell content
    data.forEach(row => {
      displayColumns.forEach(col => {
        const cellWidth = computeTextWidth(row[col]);
        if (cellWidth > widths[col] && widths[col] < maxWidth) {
          widths[col] = Math.min(cellWidth, maxWidth);
        }
      });
    });

    return widths;
  }, [data, displayColumns]);

  const tableWidth = useMemo(() => {
    return Object.values(columnWidths).reduce((sum, w) => sum + w, 0);
  }, [columnWidths]);

  const [isExpanded, setIsExpanded] = useState(false);

  // Early returns after all hooks
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
        const url = isSafeUrl(value.url) ? value.url : '#';
        let text = value.text;
        if (!text || text.trim() === '' || !isSafeUrl(text)) {
          text = 'Link';
        }
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        );
      }

      case 'Image': {
        const url = value.url;
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
        const url = value.url;
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

  const title = config.title || config.viewName;

  const renderTable = () => (
    <table className={styles.table} style={{ width: tableWidth, tableLayout: 'fixed' }}>
      <colgroup>
        {displayColumns.map(col => (
          <col key={col} style={{ width: columnWidths[col] }} />
        ))}
      </colgroup>
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
  );

  return (
    <div className={styles.viewElement}>
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

export default ViewElement;
