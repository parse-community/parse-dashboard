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
  if (!path || !obj) {return null;}

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
 * Extract a numeric value from various types (number, pointer objectId, etc.)
 * For pointers, we hash the objectId to get a consistent numeric value
 * @param {*} value - Value to extract number from
 * @returns {number|null} Numeric value or null
 */
export function extractNumericValue(value) {
  // Direct numeric value
  if (isNumeric(value)) {
    return value;
  }

  // Handle Parse Pointer objects - use objectId as string for counting
  if (value && typeof value === 'object') {
    // Parse pointer has objectId or id
    const id = value.objectId || value.id;
    if (id) {
      // For counting purposes, we'll use a hash of the objectId
      // This allows us to count unique pointers
      return simpleHash(String(id));
    }
  }

  return null;
}

/**
 * Simple hash function to convert strings to numbers
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
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
  if (!value) {return null;}

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
 * Create a composite group key from multiple group-by columns
 * @param {Object} item - Data item
 * @param {string|Array<string>} groupByColumns - Column(s) to group by
 * @returns {string} Composite group key
 */
function createGroupKey(item, groupByColumns) {
  const columns = Array.isArray(groupByColumns) ? groupByColumns : [groupByColumns];

  const parts = columns.map(col => {
    const rawValue = getNestedValue(item, col);

    // Handle pointer objects - use objectId
    if (rawValue && typeof rawValue === 'object') {
      return rawValue.objectId || rawValue.id || 'Other';
    }

    return rawValue != null ? String(rawValue) : 'Other';
  });

  return parts.join(' | ');
}

/**
 * Group data by a column and apply aggregation
 * @param {Array} data - Array of Parse objects
 * @param {string|Array<string>} groupByColumn - Column(s) to group by
 * @param {string} valueColumn - Column to aggregate
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Grouped and aggregated data
 */
export function groupAndAggregate(data, groupByColumn, valueColumn, aggregationType = 'count') {
  const groups = {};

  data.forEach(item => {
    const rawValue = getNestedValue(item, valueColumn);
    const value = extractNumericValue(rawValue);

    // Create composite group key from potentially multiple columns
    const groupKey = createGroupKey(item, groupByColumn);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    // Only add numeric values for aggregation
    if (value !== null) {
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
 * @param {string|Array<string>} valueColumn - Value column(s) for aggregation
 * @param {string|Array<string>} groupByColumn - Column(s) to group by (optional)
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Chart.js compatible data
 */
export function processPieData(data, valueColumn, groupByColumn, aggregationType = 'count') {
  if (!valueColumn || !Array.isArray(data)) {
    return null;
  }

  // Convert single valueColumn to array for uniform handling
  const valueColumns = Array.isArray(valueColumn) ? valueColumn : [valueColumn];

  if (valueColumns.length === 0) {
    return null;
  }

  let aggregatedData = {};

  if (groupByColumn) {
    // Group by column and aggregate for each value column
    valueColumns.forEach(valCol => {
      const columnData = groupAndAggregate(data, groupByColumn, valCol, aggregationType);
      // Prefix keys with column name if multiple columns
      if (valueColumns.length > 1) {
        Object.keys(columnData).forEach(key => {
          aggregatedData[`${valCol} (${key})`] = columnData[key];
        });
      } else {
        aggregatedData = { ...aggregatedData, ...columnData };
      }
    });
  } else {
    // Aggregate each value column separately
    valueColumns.forEach(valCol => {
      const values = data
        .map(item => {
          const rawValue = getNestedValue(item, valCol);
          return extractNumericValue(rawValue);
        })
        .filter(val => val !== null);

      aggregatedData[valCol] = aggregateValues(values, aggregationType);
    });
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
 * @param {string|Array<string>} valueColumn - Value column(s)
 * @param {string|Array<string>} groupByColumn - Column(s) to group by (optional)
 * @param {string} aggregationType - Aggregation type
 * @returns {Object} Chart.js compatible data
 */
export function processBarLineData(data, xColumn, valueColumn, groupByColumn, aggregationType = 'count') {
  if (!xColumn || !valueColumn || !Array.isArray(data)) {
    return null;
  }

  // Convert single valueColumn to array for uniform handling
  const valueColumns = Array.isArray(valueColumn) ? valueColumn : [valueColumn];

  if (valueColumns.length === 0) {
    return null;
  }

  // Collect unique x-axis values and group data
  const xValues = new Map(); // Use Map to store both raw value and formatted label
  const groups = {};
  let isDateAxis = false;

  data.forEach(item => {
    const xVal = getNestedValue(item, xColumn);

    if (xVal == null) {return;}

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

    // Process each value column
    valueColumns.forEach(valCol => {
      const rawValue = getNestedValue(item, valCol);
      const value = extractNumericValue(rawValue);

      if (value === null) {return;}

      // Handle groupBy column(s) - create composite key if multiple columns
      let groupKeyValue = valCol; // Use column name as default group
      if (groupByColumn && (Array.isArray(groupByColumn) ? groupByColumn.length > 0 : true)) {
        const compositeKey = createGroupKey(item, groupByColumn);
        groupKeyValue = compositeKey;
        // When groupBy is specified, combine with column name for unique series
        if (valueColumns.length > 1) {
          groupKeyValue = `${valCol} (${compositeKey})`;
        }
      }
      const groupKey = groupKeyValue;

      if (!groups[groupKey]) {
        groups[groupKey] = {};
      }
      if (!groups[groupKey][xKey]) {
        groups[groupKey][xKey] = [];
      }
      groups[groupKey][xKey].push(value);
    });
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
      if (!valueColumn || (Array.isArray(valueColumn) && valueColumn.length === 0)) {
        return { isValid: false, error: 'Pie charts require at least one value column' };
      }
      // Validate all value columns exist
      const pieValueCols = Array.isArray(valueColumn) ? valueColumn : [valueColumn];
      for (const col of pieValueCols) {
        if (!columns[col]) {
          return { isValid: false, error: `Value column '${col}' does not exist` };
        }
      }
      break;

    case 'bar':
    case 'line':
    case 'radar':
      if (!xColumn || !valueColumn || (Array.isArray(valueColumn) && valueColumn.length === 0)) {
        return { isValid: false, error: 'Bar/line charts require both X axis and at least one value column' };
      }
      if (!columns[xColumn]) {
        return { isValid: false, error: 'X column does not exist' };
      }
      // Validate all value columns exist
      const barValueCols = Array.isArray(valueColumn) ? valueColumn : [valueColumn];
      for (const col of barValueCols) {
        if (!columns[col]) {
          return { isValid: false, error: `Value column '${col}' does not exist` };
        }
      }
      break;

    default:
      return { isValid: false, error: 'Unsupported chart type' };
  }

  return { isValid: true };
}
