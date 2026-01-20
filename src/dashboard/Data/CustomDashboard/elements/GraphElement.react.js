/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import GraphPanel from 'components/GraphPanel/GraphPanel.react';
import Icon from 'components/Icon/Icon.react';
import styles from './GraphElement.scss';

const GraphElement = ({
  config,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
}) => {
  if (!config || !config.graphConfig) {
    return (
      <div className={styles.noConfig}>
        <Icon name="chart-line" width={32} height={32} fill="#64748b" />
        <p>No graph configured</p>
      </div>
    );
  }

  const title = config.title || config.graphConfig?.title || 'Graph';

  // Remove title from graphConfig to avoid duplicate display (title is shown in GraphElement header)
  const graphConfigWithoutTitle = {
    ...config.graphConfig,
    title: undefined,
  };

  return (
    <div className={styles.graphElement}>
      <div className={styles.graphHeader}>
        <span className={styles.graphTitle}>{title}</span>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className={styles.refreshButton}>
            <Icon name="refresh-solid" width={12} height={12} fill="#94a3b8" />
          </button>
        )}
      </div>
      <div className={styles.graphContainer}>
        <GraphPanel
          graphConfig={graphConfigWithoutTitle}
          data={data}
          columns={columns}
          isLoading={isLoading}
          error={error}
          disableAnimation={true}
          hideHeader={true}
          hideFooter={true}
        />
      </div>
    </div>
  );
};

export default GraphElement;
