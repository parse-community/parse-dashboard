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

  return (
    <div className={styles.graphElement}>
      <GraphPanel
        graphConfig={config.graphConfig}
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        disableAnimation={true}
      />
    </div>
  );
};

export default GraphElement;
