/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState } from 'react';
import GraphPanel from 'components/GraphPanel/GraphPanel.react';
import Icon from 'components/Icon/Icon.react';
import ExpandModal from './ExpandModal.react';
import styles from './GraphElement.scss';

const GraphElement = ({
  config,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!config || !config.graphConfig) {
    return (
      <div className={styles.noConfig}>
        <Icon name="chart-line" width={32} height={32} fill="#64748b" />
        <p>No graph configured</p>
      </div>
    );
  }

  const title = config.title || config.graphConfig?.title || 'Graph';

  // Apply overrides from config (title removed, legend and axis labels configurable)
  const modifiedGraphConfig = {
    ...config.graphConfig,
    title: undefined,
    showLegend: config.showLegend ?? config.graphConfig?.showLegend ?? true,
    showAxisLabels: config.showAxisLabels ?? config.graphConfig?.showAxisLabels ?? true,
    strokeWidthOverride: config.strokeWidthOverride || null,
  };

  const renderGraph = () => (
    <GraphPanel
      graphConfig={modifiedGraphConfig}
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      disableAnimation={true}
      hideHeader={true}
      hideFooter={true}
    />
  );

  return (
    <div className={styles.graphElement}>
      <div className={styles.graphHeader}>
        <span className={styles.graphTitle}>{title}</span>
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
      <div className={styles.graphContainer}>
        {renderGraph()}
      </div>
      {isExpanded && (
        <ExpandModal title={title} onClose={() => setIsExpanded(false)}>
          <div className={styles.expandedGraphContainer}>
            {renderGraph()}
          </div>
        </ExpandModal>
      )}
    </div>
  );
};

export default GraphElement;
