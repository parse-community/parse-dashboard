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

/**
 * Format a date tick label based on the time span using localized format
 * @param {number} timestamp - The timestamp to format
 * @param {number} timespanHours - The total time span in hours
 * @returns {string} Formatted date string in user's locale
 */
function formatDateTickLabel(timestamp, timespanHours) {
  const date = new Date(timestamp);
  // Use browser's language setting for localization
  const locale = navigator?.language || navigator?.languages?.[0];

  if (timespanHours <= 24) {
    // Show only time in localized 24-hour hh:mm format
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format for compact display
    });
  } else {
    // Show only date in localized format (respects user's locale for day/month order)
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
    });
  }
}

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
  disableAnimation = false,
  hideHeader = false,
  hideFooter = false,
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
      series,
      groupByColumn,
      maxDataPoints,
      calculatedValues,
      strokeWidthOverride,
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
          result = processPieData(limitedData, series || [], groupByColumn, calculatedValues);
          break;
        case 'bar':
        case 'line':
        case 'radar':
          result = processBarLineData(limitedData, xColumn, series || [], groupByColumn, calculatedValues);
          break;
      }

      // Helper to compute the effective chart type for a dataset
      // dataset.type overrides the global chart type
      const getEffectiveType = (dataset) => {
        return dataset.type || chartType;
      };

      // Apply line styles to datasets (convert lineStyle to Chart.js borderDash)
      if (result && result.datasets) {
        const lineStyleToBorderDash = {
          solid: [],
          dashed: [8, 4],
          dotted: [2, 2],
        };

        result.datasets = result.datasets.map(dataset => {
          const effectiveType = getEffectiveType(dataset);
          if (effectiveType === 'line') {
            // Line charts get custom or default stroke width and optional dash pattern
            // strokeWidthOverride takes precedence over individual series strokeWidth
            return {
              ...dataset,
              borderWidth: strokeWidthOverride || dataset.strokeWidth || 2,
              ...(dataset.lineStyle && lineStyleToBorderDash[dataset.lineStyle]
                ? { borderDash: lineStyleToBorderDash[dataset.lineStyle] }
                : {}),
            };
          }
          return dataset;
        });
      }

      // Apply bar styles to datasets
      if (result && result.datasets) {
        result.datasets = result.datasets.map(dataset => {
          const effectiveType = getEffectiveType(dataset);
          if (effectiveType === 'bar' && dataset.barStyle) {
            switch (dataset.barStyle) {
              case 'outlined':
                // Outlined: transparent fill with thick border
                return {
                  ...dataset,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                };
              case 'striped':
                // Striped: lighter fill with dashed border to indicate pattern
                return {
                  ...dataset,
                  backgroundColor: dataset.backgroundColor.replace('0.8', '0.3'),
                  borderWidth: 2,
                  borderDash: [4, 4],
                };
              default:
                return dataset;
            }
          }
          return dataset;
        });
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
      yAxisTitlePrimary,
      yAxisTitleSecondary,
    } = graphConfig;

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: disableAnimation ? false : undefined,
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom',
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

        // Use custom titles if provided, otherwise fall back to auto-generated
        const primaryAxisTitle = yAxisTitlePrimary
          ? [yAxisTitlePrimary]
          : splitLabel(primaryAxisSeries, 'Primary Axis');
        const secondaryAxisTitle = yAxisTitleSecondary
          ? [yAxisTitleSecondary]
          : splitLabel(secondaryAxisSeries, 'Secondary Axis');

        const hasSecondaryAxis = secondaryAxisSeries.length > 0;

        // Get date axis info for tick formatting
        const dateAxisInfo = processedData?.dateAxisInfo;

        // Build x-axis tick configuration
        const xAxisTicks = {
          maxRotation: 0, // Keep labels horizontal
          minRotation: 0,
        };

        // Add custom tick callback for date axes
        if (dateAxisInfo?.isDateAxis && dateAxisInfo.rawXValues) {
          xAxisTicks.callback = function(value) {
            // Use 'value' (data index) not 'index' (rendered tick position)
            // This ensures correct lookup when Chart.js auto-skips ticks
            const timestamp = dateAxisInfo.rawXValues[value];
            if (timestamp !== undefined) {
              return formatDateTickLabel(timestamp, dateAxisInfo.timespanHours);
            }
            return this.getLabelForValue(value);
          };
        }

        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              stacked: isStacked,
              grid: {
                display: showGrid,
              },
              ticks: xAxisTicks,
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
              position: 'bottom',
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
              title: {
                display: showAxisLabels !== false && !!yAxisTitlePrimary,
                text: yAxisTitlePrimary || '',
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
  }, [graphConfig, processedData, containerHeight, disableAnimation]);

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
      {!hideHeader && (
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
      )}

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

      {graphConfig && !hideFooter && (
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
