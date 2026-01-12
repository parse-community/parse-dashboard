/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  ScatterController,
  RadarController,
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Scatter,
  Radar,
} from 'react-chartjs-2';
import styles from './GraphPanel.scss';
import Icon from 'components/Icon/Icon.react';
import {
  processScatterData,
  processPieData,
  processBarLineData,
  validateGraphConfig,
} from 'lib/GraphDataUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  ScatterController,
  RadarController
);

const GraphPanel = ({
  graphConfig,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
  onEdit,
}) => {
  const chartRef = useRef(null);

  // Validate configuration and process data
  const { processedData, validationError } = useMemo(() => {
    if (!data || !graphConfig || !Array.isArray(data)) {
      return { processedData: null, validationError: null };
    }

    // Validate configuration
    const validation = validateGraphConfig(graphConfig, columns || {});
    if (!validation.isValid) {
      return { processedData: null, validationError: validation.error };
    }

    const {
      chartType,
      xColumn,
      yColumn,
      valueColumn,
      groupByColumn,
      aggregationType,
      maxDataPoints,
      calculatedValues,
    } = graphConfig;

    // Limit data points for performance
    const limitedData = maxDataPoints ? data.slice(0, maxDataPoints) : data;

    try {
      let result = null;
      switch (chartType) {
        case 'scatter':
          result = processScatterData(limitedData, xColumn, yColumn, maxDataPoints);
          break;
        case 'pie':
        case 'doughnut':
          result = processPieData(limitedData, valueColumn, groupByColumn, aggregationType, calculatedValues);
          break;
        case 'bar':
        case 'line':
        case 'radar':
          result = processBarLineData(limitedData, xColumn, valueColumn, groupByColumn, aggregationType, calculatedValues);
          break;
      }
      return { processedData: result, validationError: null };
    } catch (error) {
      console.error('Error processing graph data:', error);
      return { processedData: null, validationError: error.message };
    }
  }, [data, graphConfig, columns]);

  const chartOptions = useMemo(() => {
    if (!graphConfig) {return {};}

    const {
      chartType,
      title,
      showLegend,
      showGrid,
      isStacked,
    } = graphConfig;

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
        },
        title: {
          display: !!title,
          text: title,
        },
      },
    };

    // Chart type specific options
    switch (chartType) {
      case 'bar':
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              stacked: isStacked,
              grid: {
                display: showGrid,
              },
            },
            y: {
              display: true,
              stacked: isStacked,
              grid: {
                display: showGrid,
              },
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
        };

      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              display: showLegend,
              position: 'right',
            },
          },
        };

      case 'scatter':
        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              grid: {
                display: showGrid,
              },
            },
            y: {
              display: true,
              grid: {
                display: showGrid,
              },
            },
          },
        };

      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              grid: {
                display: showGrid,
              },
              ticks: {
                display: true,
              },
            },
          },
        };

      default:
        return baseOptions;
    }
  }, [graphConfig]);

  const renderChart = () => {
    if (validationError) {
      return (
        <div className={styles.error}>
          <Icon name="exclamation-triangle" width={48} height={48} fill="#ffffff" />
          <p>Configuration Error</p>
          <p>{validationError}</p>
        </div>
      );
    }

    if (!processedData || !graphConfig) {
      return (
        <div className={styles.noData}>
          <Icon name="chart-line" width={48} height={48} fill="#ffffff" />
          <p>No graph data available</p>
          <p>Configure your graph settings and select data to visualize.</p>
        </div>
      );
    }

    const { chartType } = graphConfig;
    const chartProps = {
      ref: chartRef,
      data: processedData,
      options: chartOptions,
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      default:
        return (
          <div className={styles.error}>
            <Icon name="exclamation-triangle" width={24} height={24} fill="#ffffff" />
            <p>Unsupported chart type</p>
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className={styles.error}>
        <Icon name="exclamation-triangle" width={24} height={24} fill="#ffffff" />
        <p>Error loading graph data</p>
        <p>{error.message || 'Unknown error occurred'}</p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={styles.retryButton}
            aria-label="Retry loading graph data"
          >
            <Icon name="refresh-solid" width={14} height={14} fill="#ffffff" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Graph
        </h2>
        <div className={styles.headerButtons}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={styles.editButton}
              aria-label="Edit graph configuration"
              title="Edit graph"
            >
              <Icon name="edit-solid" width={14} height={14} fill="#ffffff" />
            </button>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className={styles.refreshButton}
              aria-label="Refresh graph data"
              title="Refresh graph"
            >
              <Icon name="refresh-solid" width={14} height={14} fill="#ffffff" />
            </button>
          )}
        </div>
      </div>

      <div className={styles.chartContainer}>
        {isLoading ? (
          <div className={styles.loading}>
            <Icon name="spinner" width={24} height={24} fill="#ffffff" />
            <p>Loading graph data...</p>
          </div>
        ) : (
          <div className={styles.chart}>
            {renderChart()}
          </div>
        )}
      </div>

      {graphConfig && (
        <div className={styles.configInfo}>
          <small>
            Data points: {data?.length || 0}
            {graphConfig.maxDataPoints && data?.length > graphConfig.maxDataPoints &&
              ` (showing first ${graphConfig.maxDataPoints})`
            }
          </small>
        </div>
      )}
    </div>
  );
};

export default GraphPanel;
