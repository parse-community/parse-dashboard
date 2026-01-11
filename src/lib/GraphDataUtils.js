/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Utility functions for processing Parse data into chart-compatible formats
 */

/**
 * Get nested value from object using dot notation path
 * @param {Object} obj - The object to extract value from
 * @param {string} path - Dot notation path (e.g., 'user.name')
 * @returns {*} The value at the path
 */
export function getNestedValue(obj, path) {
  if (!path || !obj) return null;

  // Handle Parse object attributes vs raw object
  const data = obj.attributes || obj;

  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key];
    }
    return null;
  }, data);
}

/**
 * Check if a value is numeric
 * @param {*} value - Value to check
 * @returns {boolean} True if numeric
 */
export function isNumeric(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is a valid date
 * @param {*} value - Value to check
 * @returns {boolean} True if valid date
 */
export function isValidDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Convert various date formats to a standard format
 * @param {*} value - Date value to convert
 * @returns {Date|null} Converted date or null
 */
export function normalizeDate(value) {
  if (!value) return null;

  // Handle Parse Date objects
  if (value && value.iso) {
    return new Date(value.iso);
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value;
  }

  // Handle string dates
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Format a date in compact format: YYYY-MM-DD HH:mm
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateCompact(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Filter data based on column type and chart requirements
 * @param {Array} data - Array of Parse objects
 * @param {string} column - Column name to filter by
 * @param {string} requiredType - Required data type ('number', 'string', 'date')
 * @returns {Array} Filtered data
 */
export function filterDataByType(data, column, requiredType) {
  return data.filter(item => {
    const value = getNestedValue(item, column);

    switch (requiredType) {
      case 'number':
        return isNumeric(value);
      case 'string':
        return typeof value === 'string' && value.trim().length > 0;
      case 'date':
        return normalizeDate(value) !== null;
      default:
        return value != null;
    }
  });
}

/**
 * Aggregate values based on aggregation type
 * @param {Array<number>} values - Array of numeric values
 * @param {string} aggregationType - Type of aggregation ('count', 'sum', 'avg', 'min', 'max')
 * @returns {number} Aggregated value
 */
export function aggregateValues(values, aggregationType = 'count') {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  // Filter out non-numeric values
  const numericValues = values.filter(val => isNumeric(val));

  if (numericValues.length === 0) {
    return 0;
  }

  switch (aggregationType) {
    case 'sum':
      return numericValues.reduce((sum, val) => sum + val, 0);
    case 'avg':
    case 'mean':
      return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    case 'min':
      return Math.min(...numericValues);
    case 'max':
      return Math.max(...numericValues);
    case 'count':
    default:
      return numericValues.length;
  }
}

/**
 * Group data by a column and apply aggregation
 * @param {Array} data - Array of Parse objects
 * @param {string} groupByColumn - Column to group by
 * @param {string} valueColumn - Column to aggregate
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Grouped and aggregated data
 */
export function groupAndAggregate(data, groupByColumn, valueColumn, aggregationType = 'count') {
  const groups = {};

  data.forEach(item => {
    const groupValue = getNestedValue(item, groupByColumn);
    const value = getNestedValue(item, valueColumn);

    // Handle null/undefined group values
    const groupKey = groupValue != null ? String(groupValue) : 'Other';

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    // Only add numeric values for aggregation
    if (isNumeric(value)) {
      groups[groupKey].push(value);
    }
  });

  // Apply aggregation to each group
  const result = {};
  Object.keys(groups).forEach(groupKey => {
    result[groupKey] = aggregateValues(groups[groupKey], aggregationType);
  });

  return result;
}

/**
 * Process data for scatter plots
 * @param {Array} data - Array of Parse objects
 * @param {string} xColumn - X-axis column
 * @param {string} yColumn - Y-axis column
 * @param {number} maxPoints - Maximum number of points to include
 * @returns {Object} Chart.js compatible data
 */
export function processScatterData(data, xColumn, yColumn, maxPoints = 1000) {
  if (!xColumn || !yColumn || !Array.isArray(data)) {
    return null;
  }

  const points = data
    .filter(item => {
      const xVal = getNestedValue(item, xColumn);
      const yVal = getNestedValue(item, yColumn);
      return isNumeric(xVal) && isNumeric(yVal);
    })
    .slice(0, maxPoints)
    .map(item => ({
      x: getNestedValue(item, xColumn),
      y: getNestedValue(item, yColumn),
    }));

  if (points.length === 0) {
    return null;
  }

  return {
    datasets: [{
      label: `${xColumn} vs ${yColumn}`,
      data: points,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };
}

/**
 * Process data for pie/doughnut charts
 * @param {Array} data - Array of Parse objects
 * @param {string} valueColumn - Value column for aggregation
 * @param {string} groupByColumn - Column to group by (optional)
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Chart.js compatible data
 */
export function processPieData(data, valueColumn, groupByColumn, aggregationType = 'count') {
  if (!valueColumn || !Array.isArray(data)) {
    return null;
  }

  let aggregatedData;

  if (groupByColumn) {
    // Group by column and aggregate
    aggregatedData = groupAndAggregate(data, groupByColumn, valueColumn, aggregationType);
  } else {
    // Single value aggregation
    const values = data
      .map(item => getNestedValue(item, valueColumn))
      .filter(val => isNumeric(val));

    aggregatedData = {
      'All Data': aggregateValues(values, aggregationType),
    };
  }

  const labels = Object.keys(aggregatedData);
  const values = Object.values(aggregatedData);

  if (labels.length === 0 || values.every(v => v === 0)) {
    return null;
  }

  const colors = generateColors(labels.length);

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 1,
    }],
  };
}

/**
 * Process data for bar/line/radar charts
 * @param {Array} data - Array of Parse objects
 * @param {string} xColumn - X-axis column
 * @param {string} valueColumn - Value column
 * @param {string} groupByColumn - Column to group by (optional)
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Chart.js compatible data
 */
export function processBarLineData(data, xColumn, valueColumn, groupByColumn, aggregationType = 'count') {
  if (!xColumn || !valueColumn || !Array.isArray(data)) {
    return null;
  }

  // Collect unique x-axis values and group data
  const xValues = new Map(); // Use Map to store both raw value and formatted label
  const groups = {};
  let isDateAxis = false;

  data.forEach(item => {
    const xVal = getNestedValue(item, xColumn);
    const value = getNestedValue(item, valueColumn);

    if (xVal == null || !isNumeric(value)) return;

    // Check if x-axis value is a date
    const normalizedDate = normalizeDate(xVal);
    let xKey, xLabel;

    if (normalizedDate) {
      isDateAxis = true;
      xKey = normalizedDate.getTime(); // Use timestamp as key for sorting
      xLabel = formatDateCompact(normalizedDate);
    } else {
      xKey = String(xVal);
      xLabel = String(xVal);
    }

    xValues.set(xKey, xLabel);

    const groupKey = groupByColumn ? String(getNestedValue(item, groupByColumn) || 'Other') : 'All';

    if (!groups[groupKey]) {
      groups[groupKey] = {};
    }
    if (!groups[groupKey][xKey]) {
      groups[groupKey][xKey] = [];
    }
    groups[groupKey][xKey].push(value);
  });

  if (xValues.size === 0) {
    return null;
  }

  // Sort x-axis values in ascending order
  // For dates, keys are timestamps; for strings/numbers, lexicographic sort
  const sortedXKeys = Array.from(xValues.keys()).sort((a, b) => {
    if (isDateAxis) {
      return a - b; // Numeric sort for timestamps (ascending)
    }
    // Try numeric comparison first
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // Fall back to string comparison
    return String(a).localeCompare(String(b));
  });

  const sortedXLabels = sortedXKeys.map(key => xValues.get(key));
  const groupKeys = Object.keys(groups);

  const datasets = groupKeys.map((groupKey, index) => {
    const groupData = groups[groupKey];
    const values = sortedXKeys.map(xKey => {
      const groupValues = groupData[xKey] || [];
      return groupValues.length > 0 ? aggregateValues(groupValues, aggregationType) : 0;
    });

    return {
      label: groupKey,
      data: values,
      backgroundColor: generateColors(groupKeys.length)[index],
      borderColor: generateColors(groupKeys.length)[index].replace('0.8', '1'),
      borderWidth: 1,
    };
  });

  return {
    labels: sortedXLabels,
    datasets,
  };
}

/**
 * Generate a color palette for charts
 * @param {number} count - Number of colors needed
 * @returns {Array<string>} Array of RGBA color strings
 */
export function generateColors(count) {
  const baseColors = [
    'rgba(255, 99, 132, 0.8)',   // Red
    'rgba(54, 162, 235, 0.8)',  // Blue
    'rgba(255, 205, 86, 0.8)',  // Yellow
    'rgba(75, 192, 192, 0.8)',  // Teal
    'rgba(153, 102, 255, 0.8)', // Purple
    'rgba(255, 159, 64, 0.8)',  // Orange
    'rgba(201, 203, 207, 0.8)', // Grey
    'rgba(255, 87, 51, 0.8)',   // Coral
    'rgba(51, 255, 87, 0.8)',   // Green
    'rgba(87, 51, 255, 0.8)',   // Indigo
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors using HSL
  const additionalColors = [];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation
    additionalColors.push(`hsla(${hue}, 70%, 50%, 0.8)`);
  }

  return [...baseColors, ...additionalColors];
}

/**
 * Validate graph configuration
 * @param {Object} config - Graph configuration object
 * @param {Object} columns - Available columns with types
 * @returns {Object} Validation result with isValid boolean and error message
 */
export function validateGraphConfig(config, columns) {
  if (!config) {
    return { isValid: false, error: 'No configuration provided' };
  }

  const { chartType, xColumn, yColumn, valueColumn } = config;

  if (!chartType) {
    return { isValid: false, error: 'Chart type is required' };
  }

  // Check required columns based on chart type
  switch (chartType) {
    case 'scatter':
      if (!xColumn || !yColumn) {
        return { isValid: false, error: 'Scatter plots require both X and Y axis columns' };
      }
      if (!columns[xColumn] || !columns[yColumn]) {
        return { isValid: false, error: 'Selected columns do not exist' };
      }
      break;

    case 'pie':
    case 'doughnut':
      if (!valueColumn) {
        return { isValid: false, error: 'Pie charts require a value column' };
      }
      if (!columns[valueColumn]) {
        return { isValid: false, error: 'Selected value column does not exist' };
      }
      break;

    case 'bar':
    case 'line':
    case 'radar':
      if (!xColumn || !valueColumn) {
        return { isValid: false, error: 'Bar/line charts require both X axis and value columns' };
      }
      if (!columns[xColumn] || !columns[valueColumn]) {
        return { isValid: false, error: 'Selected columns do not exist' };
      }
      break;

    default:
      return { isValid: false, error: 'Unsupported chart type' };
  }

  return { isValid: true };
}