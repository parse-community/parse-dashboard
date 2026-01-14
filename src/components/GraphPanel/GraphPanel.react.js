/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  onClose,
  availableGraphs = [],
  onGraphSelect,
  onNewGraph,
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showGraphDropdown, setShowGraphDropdown] = useState(false);

  // Measure container height for dynamic label sizing
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGraphDropdown(false);
      }
    };

    if (showGraphDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGraphDropdown]);

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
          result = processScatterData(data, xColumn, yColumn, maxDataPoints);
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
    } catch (err) {
      console.error('Error processing graph data:', err);
      return { processedData: null, validationError: err instanceof Error ? err.message : String(err) };
    }
  }, [data, graphConfig, columns]);

  const chartOptions = useMemo(() => {
    if (!graphConfig) {return {};}

    const {
      chartType,
      title,
      showLegend,
      showGrid,
      showAxisLabels,
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
      case 'line': {
        // Determine which series are on each axis
        const primaryAxisSeries = [];
        const secondaryAxisSeries = [];

        if (processedData && processedData.datasets) {
          processedData.datasets.forEach(dataset => {
            if (dataset.yAxisID === 'y1') {
              secondaryAxisSeries.push(dataset.label);
            } else {
              primaryAxisSeries.push(dataset.label);
            }
          });
        }

        // Split long labels into multiple lines for better display
        // Dynamically calculate max line length based on chart height
        // Formula: Base of 20 chars + 1 additional char per 15px of height
        // Examples: 300px = 40 chars, 450px = 50 chars, 600px = 60 chars
        const maxLineLength = Math.max(20, 20 + Math.floor(containerHeight / 15));

        const splitLabel = (series, defaultLabel) => {
          if (series.length === 0) {
            return [defaultLabel];
          }
          const joined = series.join(', ');
          // If label is too long, split into multiple lines
          if (joined.length > maxLineLength) {
            const lines = [];
            let currentLine = '';
            series.forEach((item, idx) => {
              const separator = idx === 0 ? '' : ', ';
              const testLine = currentLine + separator + item;
              if (testLine.length > maxLineLength && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = item;
              } else {
                currentLine = testLine;
              }
            });
            if (currentLine) {
              lines.push(currentLine);
            }
            return lines;
          }
          return [joined];
        };

        const primaryAxisTitle = splitLabel(primaryAxisSeries, 'Primary Axis');
        const secondaryAxisTitle = splitLabel(secondaryAxisSeries, 'Secondary Axis');

        const hasSecondaryAxis = secondaryAxisSeries.length > 0;

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
              position: 'left',
              title: {
                display: showAxisLabels !== false,
                text: primaryAxisTitle,
                font: {
                  size: 12,
                },
                padding: {
                  top: 10,
                  bottom: 10,
                },
              },
            },
            y1: {
              display: hasSecondaryAxis,
              stacked: isStacked,
              grid: {
                display: false, // Don't show grid for secondary axis to avoid overlap
              },
              position: 'right',
              title: {
                display: showAxisLabels !== false && hasSecondaryAxis,
                text: secondaryAxisTitle,
                font: {
                  size: 12,
                },
                padding: {
                  top: 10,
                  bottom: 10,
                },
              },
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
        };
      }

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
              angleLines: {
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
  }, [graphConfig, processedData, containerHeight]);

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

    if (!graphConfig) {
      return (
        <div className={styles.noData}>
          <Icon name="chart-line" width={48} height={48} fill="#ffffff" />
          <p>No graph configured.</p>
          {onNewGraph && (
            <>
              <button className={styles.createGraphButton} onClick={() => onNewGraph()}>
                Create Graph
              </button>
              <p className={styles.previewNotice}>
                Graph is a preview feature. Future versions may introduce breaking changes without announcement.
              </p>
            </>
          )}
        </div>
      );
    }

    if (!processedData) {
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

  const currentGraphTitle = graphConfig?.title || 'Graph';
  // Only show dropdown/buttons when there's an active graph configuration
  const hasActiveGraph = !!graphConfig;
  const showDropdown = hasActiveGraph && availableGraphs && availableGraphs.length > 0;

  const handleGraphSelect = (graph) => {
    if (onGraphSelect) {
      onGraphSelect(graph);
    }
    setShowGraphDropdown(false);
  };

  const handleNewGraph = () => {
    if (onNewGraph) {
      onNewGraph();
    }
    setShowGraphDropdown(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{currentGraphTitle}</h2>
        <div className={styles.headerButtons}>
          {showDropdown && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => setShowGraphDropdown(!showGraphDropdown)}
                aria-label="Select graph"
                title="Select graph"
              >
                <Icon name="down-solid" width={14} height={14} fill="#ffffff" />
              </button>
              {showGraphDropdown && (
                <div className={styles.dropdownMenu}>
                  {availableGraphs.map((graph) => (
                    <button
                      key={graph.id}
                      className={`${styles.dropdownItem} ${graph.id === graphConfig?.id ? styles.dropdownItemActive : ''}`}
                      onClick={() => handleGraphSelect(graph)}
                    >
                      <span className={styles.dropdownItemTitle}>
                        {graph.title || 'Graph'}
                      </span>
                      <span className={styles.dropdownItemType}>
                        {graph.chartType}
                      </span>
                    </button>
                  ))}
                  <div className={styles.dropdownSeparator} />
                  <button
                    className={styles.dropdownItem}
                    onClick={handleNewGraph}
                  >
                    <Icon name="plus" width={12} height={12} />
                    <span>Create Graph</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {hasActiveGraph && onEdit && (
            <button
              type="button"
              onClick={() => onEdit()}
              className={styles.editButton}
              aria-label="Edit graph configuration"
              title="Edit graph"
            >
              <Icon name="edit-solid" width={14} height={14} fill="#ffffff" />
            </button>
          )}
          {hasActiveGraph && onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              className={styles.refreshButton}
              aria-label="Refresh graph data"
              title="Refresh graph"
            >
              <Icon name="refresh-solid" width={14} height={14} fill="#ffffff" />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={() => onClose()}
              className={styles.closeButton}
              aria-label="Close graph panel"
              title="Close graph"
            >
              <Icon name="x-solid" width={14} height={14} fill="#ffffff" />
            </button>
          )}
        </div>
      </div>

      <div className={styles.chartContainer} ref={containerRef}>
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
