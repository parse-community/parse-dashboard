/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { evaluateFormula, buildVariables } from './FormulaEvaluator';

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

  const result = path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key];
    }
    return null;
  }, data);

  // Convert undefined to null for consistency
  return result === undefined ? null : result;
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

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

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
 * Calculate a value based on operator and fields
 * @param {Object} item - Data item
 * @param {Array<string>} fields - Fields to use in calculation
 * @param {string} operator - Calculation operator (sum, percent, average, difference, ratio, formula)
 * @param {string} formula - Formula string (only used when operator is 'formula')
 * @param {Array<string>} availableFields - All available field names for formula evaluation
 * @returns {number|null} Calculated value or null
 */
function calculateValue(item, fields, operator, formula = null, availableFields = []) {
  // Handle formula operator separately
  if (operator === 'formula') {
    if (!formula || typeof formula !== 'string' || formula.trim() === '') {
      return null;
    }

    // Build variables from all available fields
    const fieldValues = {};
    for (const field of availableFields) {
      const rawValue = getNestedValue(item, field);
      const numericValue = extractNumericValue(rawValue);
      if (field) {
        fieldValues[field] = numericValue !== null ? numericValue : 0;
      }
    }

    // Add item attributes directly (for previous calculated values)
    const data = item.attributes || item;
    for (const key of Object.keys(data)) {
      if (key && !(key in fieldValues)) {
        const value = data[key];
        if (typeof value === 'number' && isFinite(value)) {
          fieldValues[key] = value;
        }
      }
    }

    // Build variables with both plain and $-prefixed versions
    return evaluateFormula(formula, buildVariables(fieldValues));
  }

  // Standard operators require fields
  if (!fields || fields.length === 0) {
    return null;
  }

  // Extract numeric values from all fields
  const values = fields
    .map(field => {
      const rawValue = getNestedValue(item, field);
      return extractNumericValue(rawValue);
    })
    .filter(val => val !== null);

  if (values.length === 0) {
    return null;
  }

  switch (operator) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);

    case 'average':
      return values.reduce((acc, val) => acc + val, 0) / values.length;

    case 'difference':
      // Subtract all subsequent values from the first
      return values.reduce((acc, val, index) => index === 0 ? val : acc - val, 0);

    case 'ratio': {
      // Divide first value by second (or product of all others)
      if (values.length < 2) {return null;}
      const denominator = values.slice(1).reduce((acc, val) => acc * val, 1);
      return denominator !== 0 ? values[0] / denominator : null;
    }

    case 'percent': {
      // Calculate percentage: (numerator / denominator) * 100
      if (values.length < 2) {return null;}
      const numerator = values[0];
      const denominator = values[1];
      return denominator !== 0 ? (numerator / denominator) * 100 : null;
    }

    default:
      return null;
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
 * Get the display label for a series
 * @param {Object} s - Series definition
 * @param {number} index - Series index (for fallback naming)
 * @returns {string} Series label
 */
function getSeriesLabel(s, index) {
  // Use title if provided
  if (s.title && s.title.trim() !== '') {
    return s.title;
  }
  // Fall back to fields
  const fields = s.fields || [];
  if (fields.length === 1) {
    return fields[0];
  }
  if (fields.length > 1) {
    return fields.join(' + ');
  }
  // Last resort
  return `Series ${index + 1}`;
}

/**
 * Process data for pie/doughnut charts
 * @param {Array} data - Array of Parse objects
 * @param {Array} series - Series definitions with fields, title, aggregationType, color, etc.
 * @param {string|Array<string>} groupByColumn - Column(s) to group by (optional)
 * @param {Array} calculatedValues - Calculated value definitions (optional)
 * @returns {Object} Chart.js compatible data
 */
export function processPieData(data, series, groupByColumn, calculatedValues = null) {
  if (!Array.isArray(data)) {
    return null;
  }

  // Convert series to array if needed and extract value columns
  const seriesArray = Array.isArray(series) ? series : [];
  const hasCalculatedValues = calculatedValues && Array.isArray(calculatedValues) && calculatedValues.length > 0;

  // Must have at least one series or calculated value
  if (seriesArray.length === 0 && !hasCalculatedValues) {
    return null;
  }

  // Build a map of series styles for color lookup
  // Use title if available, otherwise first field or generated name
  const seriesStyleMap = new Map();
  seriesArray.forEach((s, idx) => {
    const seriesLabel = getSeriesLabel(s, idx);
    seriesStyleMap.set(seriesLabel, s);
  });

  const aggregatedData = {};

  if (groupByColumn) {
    // Group by column and aggregate for each series
    seriesArray.forEach((s, idx) => {
      const fields = s.fields || [];
      if (fields.length === 0) {
        return;
      }

      const seriesLabel = getSeriesLabel(s, idx);

      // For multi-field series, we need to aggregate across all fields
      const groups = {};
      data.forEach(item => {
        const groupKey = createGroupKey(item, groupByColumn);
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }

        // Sum values from all fields in this series for this item
        let combinedValue = 0;
        let hasValue = false;
        fields.forEach(field => {
          const rawValue = getNestedValue(item, field);
          const value = extractNumericValue(rawValue);
          if (value !== null) {
            combinedValue += value;
            hasValue = true;
          }
        });

        if (hasValue) {
          groups[groupKey].push(combinedValue);
        }
      });

      // Apply aggregation to each group
      Object.keys(groups).forEach(groupKey => {
        const labelKey = `${seriesLabel} (${groupKey})`;
        aggregatedData[labelKey] = aggregateValues(groups[groupKey], s.aggregationType || 'count');
      });
    });
  } else {
    // Aggregate each series separately
    seriesArray.forEach((s, idx) => {
      const fields = s.fields || [];
      if (fields.length === 0) {
        return;
      }

      const seriesLabel = getSeriesLabel(s, idx);

      // For multi-field series, sum values from all fields for each item
      const values = data
        .map(item => {
          let combinedValue = 0;
          let hasValue = false;
          fields.forEach(field => {
            const rawValue = getNestedValue(item, field);
            const value = extractNumericValue(rawValue);
            if (value !== null) {
              combinedValue += value;
              hasValue = true;
            }
          });
          return hasValue ? combinedValue : null;
        })
        .filter(val => val !== null);

      aggregatedData[seriesLabel] = aggregateValues(values, s.aggregationType || 'count');
    });
  }

  // Process calculated values - with support for referencing other calculated values
  if (calculatedValues && Array.isArray(calculatedValues)) {
    // First, we need to compute all calculated values for each row
    const rowsWithCalcValues = data.map(item => {
      const calculatedValuesForRow = {};

      calculatedValues.forEach(calc => {
        // Formula operator doesn't require fields, other operators do
        const hasRequiredConfig = calc.operator === 'formula'
          ? (calc.formula && calc.name)
          : (calc.fields && calc.fields.length > 0 && calc.name);

        if (hasRequiredConfig) {
          // Create an enhanced item that includes previously calculated values
          const enhancedItem = { ...item };
          if (item.attributes) {
            enhancedItem.attributes = { ...item.attributes, ...calculatedValuesForRow };
          } else {
            Object.assign(enhancedItem, calculatedValuesForRow);
          }

          // Build available fields for formula evaluation
          const availableFields = [];
          seriesArray.forEach((s, idx) => {
            const fields = s.fields || [];
            fields.forEach(field => {
              if (!availableFields.includes(field)) {
                availableFields.push(field);
              }
            });
            // Also add series title if present
            const seriesLabel = getSeriesLabel(s, idx);
            if (seriesLabel && !availableFields.includes(seriesLabel)) {
              availableFields.push(seriesLabel);
            }
          });
          // Add previously calculated value names
          Object.keys(calculatedValuesForRow).forEach(name => {
            if (!availableFields.includes(name)) {
              availableFields.push(name);
            }
          });

          const calcValue = calculateValue(enhancedItem, calc.fields, calc.operator, calc.formula, availableFields);
          calculatedValuesForRow[calc.name] = calcValue;
        }
      });

      return { item, calculatedValues: calculatedValuesForRow };
    });

    // Now process each calculated value with grouping
    calculatedValues.forEach(calc => {
      // Formula operator doesn't require fields, other operators do
      const hasRequiredConfig = calc.operator === 'formula'
        ? (calc.formula && calc.name)
        : (calc.fields && calc.fields.length > 0 && calc.name);

      if (hasRequiredConfig) {
        if (groupByColumn) {
          // Group calculated values by the same groupByColumn
          const groups = {};
          // For percent operator, track numerator/denominator separately
          const percentComponents = {};
          // For average operator, track field values separately
          const averageComponents = {};

          rowsWithCalcValues.forEach(({ item, calculatedValues: calcVals }) => {
            const calcValue = calcVals[calc.name];
            if (calcValue !== null) {
              const groupKey = createGroupKey(item, groupByColumn);
              if (!groups[groupKey]) {
                groups[groupKey] = [];
              }
              groups[groupKey].push(calcValue);

              const enhancedItem = { ...item };
              if (item.attributes) {
                enhancedItem.attributes = { ...item.attributes, ...calcVals };
              } else {
                Object.assign(enhancedItem, calcVals);
              }

              // For percent operator, also track raw numerator/denominator
              if (calc.operator === 'percent' && calc.fields && calc.fields.length >= 2) {
                const numVal = extractNumericValue(getNestedValue(enhancedItem, calc.fields[0]));
                const denVal = extractNumericValue(getNestedValue(enhancedItem, calc.fields[1]));
                if (numVal !== null && denVal !== null) {
                  if (!percentComponents[groupKey]) {
                    percentComponents[groupKey] = { numerators: [], denominators: [] };
                  }
                  percentComponents[groupKey].numerators.push(numVal);
                  percentComponents[groupKey].denominators.push(denVal);
                }
              }

              // For average operator, track individual field values
              if (calc.operator === 'average' && calc.fields && calc.fields.length > 0) {
                if (!averageComponents[groupKey]) {
                  averageComponents[groupKey] = { values: [], numFields: calc.fields.length };
                }
                calc.fields.forEach(field => {
                  const numVal = extractNumericValue(getNestedValue(enhancedItem, field));
                  if (numVal !== null) {
                    averageComponents[groupKey].values.push(numVal);
                  }
                });
              }
            }
          });

          // Aggregate each group
          Object.keys(groups).forEach(groupKey => {
            const labelKey = `${calc.name} (${groupKey})`;

            // For percent operator, calculate (sum of numerators / sum of denominators) * 100
            if (calc.operator === 'percent' && percentComponents[groupKey]) {
              const components = percentComponents[groupKey];
              const sumNumerator = components.numerators.reduce((acc, val) => acc + val, 0);
              const sumDenominator = components.denominators.reduce((acc, val) => acc + val, 0);
              aggregatedData[labelKey] = sumDenominator !== 0 ? (sumNumerator / sumDenominator) * 100 : 0;
            } else if (calc.operator === 'average' && averageComponents[groupKey]) {
              // For average operator, calculate (sum of all field values) / numFields
              const components = averageComponents[groupKey];
              const sumValues = components.values.reduce((acc, val) => acc + val, 0);
              aggregatedData[labelKey] = components.numFields > 0 ? sumValues / components.numFields : 0;
            } else {
              // For other ratio-based operators (ratio, formula), average the results
              // For other operators, sum the results
              let aggType = 'sum';
              if (calc.operator === 'ratio' || calc.operator === 'formula') {
                aggType = 'avg';
              }
              aggregatedData[labelKey] = aggregateValues(groups[groupKey], aggType);
            }
          });
        } else {
          // No grouping - aggregate all calculated values together
          const calcValues = rowsWithCalcValues
            .map(({ calculatedValues: calcVals }) => calcVals[calc.name])
            .filter(val => val !== null);

          if (calcValues.length > 0) {
            // For percent operator, calculate (sum of numerators / sum of denominators) * 100
            if (calc.operator === 'percent' && calc.fields && calc.fields.length >= 2) {
              let sumNumerator = 0;
              let sumDenominator = 0;
              rowsWithCalcValues.forEach(({ item, calculatedValues: calcVals }) => {
                const enhancedItem = { ...item };
                if (item.attributes) {
                  enhancedItem.attributes = { ...item.attributes, ...calcVals };
                } else {
                  Object.assign(enhancedItem, calcVals);
                }
                const numVal = extractNumericValue(getNestedValue(enhancedItem, calc.fields[0]));
                const denVal = extractNumericValue(getNestedValue(enhancedItem, calc.fields[1]));
                if (numVal !== null && denVal !== null) {
                  sumNumerator += numVal;
                  sumDenominator += denVal;
                }
              });
              aggregatedData[calc.name] = sumDenominator !== 0 ? (sumNumerator / sumDenominator) * 100 : 0;
            } else if (calc.operator === 'average' && calc.fields && calc.fields.length > 0) {
              // For average operator, calculate (sum of all field values) / numFields
              let sumValues = 0;
              const numFields = calc.fields.length;
              rowsWithCalcValues.forEach(({ item, calculatedValues: calcVals }) => {
                const enhancedItem = { ...item };
                if (item.attributes) {
                  enhancedItem.attributes = { ...item.attributes, ...calcVals };
                } else {
                  Object.assign(enhancedItem, calcVals);
                }
                calc.fields.forEach(field => {
                  const numVal = extractNumericValue(getNestedValue(enhancedItem, field));
                  if (numVal !== null) {
                    sumValues += numVal;
                  }
                });
              });
              aggregatedData[calc.name] = numFields > 0 ? sumValues / numFields : 0;
            } else {
              // For other ratio-based operators (ratio, formula), average the results
              // For other operators, sum the results
              let aggType = 'sum';
              if (calc.operator === 'ratio' || calc.operator === 'formula') {
                aggType = 'avg';
              }
              aggregatedData[calc.name] = aggregateValues(calcValues, aggType);
            }
          }
        }
      }
    });
  }

  const labels = Object.keys(aggregatedData);
  const values = Object.values(aggregatedData);

  if (labels.length === 0 || values.every(v => v === 0)) {
    return null;
  }

  // Generate default colors, then apply custom colors from series or calculated values
  const defaultColors = generateColors(labels.length);

  // Build a map of colors from calculated values
  const calcValueColorMap = new Map();
  if (calculatedValues && Array.isArray(calculatedValues)) {
    calculatedValues.forEach(calc => {
      if (calc.name && calc.color) {
        calcValueColorMap.set(calc.name, calc.color);
      }
    });
  }

  const colors = labels.map((label, index) => {
    // Check series style map first
    const seriesStyle = seriesStyleMap.get(label);
    if (seriesStyle && seriesStyle.color) {
      return seriesStyle.color;
    }
    // Check calculated value color
    if (calcValueColorMap.has(label)) {
      return calcValueColorMap.get(label);
    }
    return defaultColors[index];
  });

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
 * @param {Array} series - Series definitions with field, aggregationType, color, etc.
 * @param {string|Array<string>} groupByColumn - Column(s) to group by (optional)
 * @param {Array} calculatedValues - Calculated value definitions (optional)
 * @returns {Object} Chart.js compatible data
 */
export function processBarLineData(data, xColumn, series, groupByColumn, calculatedValues = null) {
  if (!xColumn || !Array.isArray(data)) {
    return null;
  }

  // Convert series to array if needed
  const seriesArray = Array.isArray(series) ? series : [];
  const hasCalculatedValues = calculatedValues && Array.isArray(calculatedValues) && calculatedValues.length > 0;

  // Must have at least one series or calculated value
  if (seriesArray.length === 0 && !hasCalculatedValues) {
    return null;
  }

  // Build a map of series styles for lookup
  // Use title if available, otherwise first field or generated name
  const seriesStyleMap = new Map();
  seriesArray.forEach((s, idx) => {
    const seriesLabel = getSeriesLabel(s, idx);
    seriesStyleMap.set(seriesLabel, s);
  });

  // Collect unique x-axis values and group data
  const xValues = new Map(); // Use Map to store both raw value and formatted label
  const groups = {};
  // Special tracking for percent operator - stores raw numerator/denominator values
  // so we can calculate (sum of numerators / sum of denominators) * 100 instead of averaging percentages
  const percentComponents = {};
  // Special tracking for average operator - stores individual field values
  // so we can calculate (sum of all field values) / numFields instead of averaging per-row averages
  const averageComponents = {};
  let isDateAxis = false;
  let hasNonDateAxisValue = false;

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
      hasNonDateAxisValue = true;
      xKey = String(xVal);
      xLabel = String(xVal);
    }

    xValues.set(xKey, xLabel);

    // Create an extended item that will hold calculated values for this row
    const calculatedValuesForRow = {};

    // Process each series
    seriesArray.forEach((s, idx) => {
      const fields = s.fields || [];
      if (fields.length === 0) {
        return;
      }

      const seriesLabel = getSeriesLabel(s, idx);

      // For multi-field series, sum values from all fields
      let combinedValue = 0;
      let hasValue = false;
      fields.forEach(field => {
        const rawValue = getNestedValue(item, field);
        const value = extractNumericValue(rawValue);
        if (value !== null) {
          combinedValue += value;
          hasValue = true;
        }
      });

      if (!hasValue) {return;}

      // Handle groupBy column(s) - create composite key if multiple columns
      let groupKeyValue = seriesLabel; // Use series label as default group
      if (groupByColumn && (Array.isArray(groupByColumn) ? groupByColumn.length > 0 : true)) {
        const compositeKey = createGroupKey(item, groupByColumn);
        groupKeyValue = `${seriesLabel} (${compositeKey})`;
      }
      const groupKey = groupKeyValue;

      if (!groups[groupKey]) {
        groups[groupKey] = {};
      }
      if (!groups[groupKey][xKey]) {
        groups[groupKey][xKey] = [];
      }
      groups[groupKey][xKey].push(combinedValue);
    });

    // Process calculated values - with support for referencing other calculated values
    if (calculatedValues && Array.isArray(calculatedValues)) {
      calculatedValues.forEach(calc => {
        // Formula operator doesn't require fields, other operators do
        const hasRequiredConfig = calc.operator === 'formula'
          ? (calc.formula && calc.name)
          : (calc.fields && calc.fields.length > 0 && calc.name);

        if (hasRequiredConfig) {
          // Create an enhanced item that includes previously calculated values
          const enhancedItem = { ...item };
          if (item.attributes) {
            enhancedItem.attributes = { ...item.attributes, ...calculatedValuesForRow };
          } else {
            Object.assign(enhancedItem, calculatedValuesForRow);
          }

          // Build available fields for formula evaluation
          const availableFields = [];
          seriesArray.forEach((s, idx) => {
            const fields = s.fields || [];
            fields.forEach(field => {
              if (!availableFields.includes(field)) {
                availableFields.push(field);
              }
            });
            // Also add series title if present
            const seriesLabel = getSeriesLabel(s, idx);
            if (seriesLabel && !availableFields.includes(seriesLabel)) {
              availableFields.push(seriesLabel);
            }
          });
          // Add previously calculated value names
          Object.keys(calculatedValuesForRow).forEach(name => {
            if (!availableFields.includes(name)) {
              availableFields.push(name);
            }
          });

          const calcValue = calculateValue(enhancedItem, calc.fields, calc.operator, calc.formula, availableFields);

          // Store this calculated value so it can be referenced by subsequent calculations
          calculatedValuesForRow[calc.name] = calcValue;

          if (calcValue !== null) {
            // Apply groupBy logic to calculated values, same as regular values
            let groupKeyValue = calc.name;
            if (groupByColumn && (Array.isArray(groupByColumn) ? groupByColumn.length > 0 : true)) {
              const compositeKey = createGroupKey(item, groupByColumn);
              groupKeyValue = `${calc.name} (${compositeKey})`;
            }
            const groupKey = groupKeyValue;

            if (!groups[groupKey]) {
              groups[groupKey] = {};
            }
            if (!groups[groupKey][xKey]) {
              groups[groupKey][xKey] = [];
            }

            // For percent operator, store raw numerator/denominator values separately
            // so we can calculate (sum of numerators / sum of denominators) * 100
            // instead of averaging individual percentages
            if (calc.operator === 'percent' && calc.fields && calc.fields.length >= 2) {
              // Extract numerator and denominator values
              const numeratorValue = getNestedValue(enhancedItem, calc.fields[0]);
              const denominatorValue = getNestedValue(enhancedItem, calc.fields[1]);
              const numVal = extractNumericValue(numeratorValue);
              const denVal = extractNumericValue(denominatorValue);

              if (numVal !== null && denVal !== null) {
                if (!percentComponents[groupKey]) {
                  percentComponents[groupKey] = {};
                }
                if (!percentComponents[groupKey][xKey]) {
                  percentComponents[groupKey][xKey] = { numerators: [], denominators: [] };
                }
                percentComponents[groupKey][xKey].numerators.push(numVal);
                percentComponents[groupKey][xKey].denominators.push(denVal);
              }
            }

            // For average operator, store individual field values separately
            // so we can calculate (sum of all field values) / numFields
            // instead of averaging individual per-row averages
            if (calc.operator === 'average' && calc.fields && calc.fields.length > 0) {
              if (!averageComponents[groupKey]) {
                averageComponents[groupKey] = {};
              }
              if (!averageComponents[groupKey][xKey]) {
                averageComponents[groupKey][xKey] = { values: [], numFields: calc.fields.length };
              }
              // Store each field value
              calc.fields.forEach(field => {
                const fieldValue = getNestedValue(enhancedItem, field);
                const numVal = extractNumericValue(fieldValue);
                if (numVal !== null) {
                  averageComponents[groupKey][xKey].values.push(numVal);
                }
              });
            }

            groups[groupKey][xKey].push(calcValue);
          }
        }
      });
    }
  });

  if (xValues.size === 0) {
    return null;
  }

  // Sort x-axis values in ascending order
  // For dates, keys are timestamps; for strings/numbers, lexicographic sort
  const sortedXKeys = Array.from(xValues.keys()).sort((a, b) => {
    if (isDateAxis && !hasNonDateAxisValue) {
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

  // Create maps for series properties (aggregationType, chartType, color, line style, bar style, secondary Y axis)
  // This handles both simple series labels and grouped names like "SeriesLabel (GroupValue)"
  const seriesAggregationMap = new Map();
  const seriesChartTypeMap = new Map();
  const seriesSecondaryYAxisMap = new Map();
  const seriesColorMap = new Map();
  const seriesLineStyleMap = new Map();
  const seriesBarStyleMap = new Map();
  const seriesStrokeWidthMap = new Map();
  seriesArray.forEach((s, idx) => {
    const seriesLabel = getSeriesLabel(s, idx);
    // Map all possible variations of this series' group keys
    groupKeys.forEach(groupKey => {
      // Check if this groupKey belongs to this series
      // Series/calc names cannot contain parentheses, so startsWith is safe
      const belongsToSeries = groupKey === seriesLabel || groupKey.startsWith(`${seriesLabel} (`);

      if (belongsToSeries) {
        seriesAggregationMap.set(groupKey, s.aggregationType || 'count');
        if (s.chartType) {
          seriesChartTypeMap.set(groupKey, s.chartType);
        }
        if (s.useSecondaryYAxis) {
          seriesSecondaryYAxisMap.set(groupKey, true);
        }
        if (s.color) {
          seriesColorMap.set(groupKey, s.color);
        }
        if (s.lineStyle) {
          seriesLineStyleMap.set(groupKey, s.lineStyle);
        }
        if (s.barStyle) {
          seriesBarStyleMap.set(groupKey, s.barStyle);
        }
        if (s.strokeWidth != null) {
          seriesStrokeWidthMap.set(groupKey, s.strokeWidth);
        }
      }
    });
  });

  // Create maps for calculated value properties (operator, chartType, secondary Y axis, color, line style, bar style)
  // This handles both simple calc names and grouped calc names like "CalcName (GroupValue)"
  const calcValueOperatorMap = new Map();
  const calcValueChartTypeMap = new Map();
  const calcValueSecondaryYAxisMap = new Map();
  const calcValueColorMap = new Map();
  const calcValueLineStyleMap = new Map();
  const calcValueBarStyleMap = new Map();
  const calcValueStrokeWidthMap = new Map();
  if (calculatedValues && Array.isArray(calculatedValues)) {
    calculatedValues.forEach(calc => {
      if (calc.name && calc.operator) {
        // Map all possible variations of this calculated value's group keys
        groupKeys.forEach(groupKey => {
          // Check if this groupKey belongs to this calculated value
          // Calc names cannot contain parentheses, so startsWith is safe
          const belongsToCalc = groupKey === calc.name || groupKey.startsWith(`${calc.name} (`);

          if (belongsToCalc) {
            calcValueOperatorMap.set(groupKey, calc.operator);
            if (calc.chartType) {
              calcValueChartTypeMap.set(groupKey, calc.chartType);
            }
            if (calc.useSecondaryYAxis) {
              calcValueSecondaryYAxisMap.set(groupKey, true);
            }
            if (calc.color) {
              calcValueColorMap.set(groupKey, calc.color);
            }
            if (calc.lineStyle) {
              calcValueLineStyleMap.set(groupKey, calc.lineStyle);
            }
            if (calc.barStyle) {
              calcValueBarStyleMap.set(groupKey, calc.barStyle);
            }
            if (calc.strokeWidth != null) {
              calcValueStrokeWidthMap.set(groupKey, calc.strokeWidth);
            }
          }
        });
      }
    });
  }

  // Generate colors once for all datasets
  const defaultColors = generateColors(groupKeys.length);

  const datasets = groupKeys.map((groupKey, index) => {
    const groupData = groups[groupKey];
    const values = sortedXKeys.map(xKey => {
      const groupValues = groupData[xKey] || [];

      // Check if this is a calculated value
      const calcOperator = calcValueOperatorMap.get(groupKey);

      if (calcOperator) {
        // Special handling for percent operator: calculate (sum of numerators / sum of denominators) * 100
        // This gives the correct percentage of totals rather than average of individual percentages
        if (calcOperator === 'percent' && percentComponents[groupKey] && percentComponents[groupKey][xKey]) {
          const components = percentComponents[groupKey][xKey];
          const sumNumerator = components.numerators.reduce((acc, val) => acc + val, 0);
          const sumDenominator = components.denominators.reduce((acc, val) => acc + val, 0);
          return sumDenominator !== 0 ? (sumNumerator / sumDenominator) * 100 : 0;
        }

        // Special handling for average operator: calculate (sum of all field values) / numFields
        // This gives the correct average of totals rather than average of individual per-row averages
        if (calcOperator === 'average' && averageComponents[groupKey] && averageComponents[groupKey][xKey]) {
          const components = averageComponents[groupKey][xKey];
          const sumValues = components.values.reduce((acc, val) => acc + val, 0);
          return components.numFields > 0 ? sumValues / components.numFields : 0;
        }

        // For other ratio-based operators (ratio, formula), average the results
        // For other operators (sum, difference), sum the results
        let calcAggType = 'sum';
        if (calcOperator === 'ratio' || calcOperator === 'formula') {
          calcAggType = 'avg';
        }
        return groupValues.length > 0 ? aggregateValues(groupValues, calcAggType) : 0;
      } else {
        // For regular series, use the series' aggregationType
        const seriesAggType = seriesAggregationMap.get(groupKey) || 'count';
        return groupValues.length > 0 ? aggregateValues(groupValues, seriesAggType) : 0;
      }
    });

    // Get custom styles for this series if available
    // Priority: series color > calculated value color > default
    const color = seriesColorMap.get(groupKey) || calcValueColorMap.get(groupKey) || defaultColors[index];

    // Get line style - prefer series style, then calculated value style
    const lineStyle = seriesLineStyleMap.get(groupKey) || calcValueLineStyleMap.get(groupKey);
    // Get bar style - prefer series style, then calculated value style
    const barStyle = seriesBarStyleMap.get(groupKey) || calcValueBarStyleMap.get(groupKey);
    // Get stroke width - prefer series style, then calculated value style
    const strokeWidth = seriesStrokeWidthMap.get(groupKey) ?? calcValueStrokeWidthMap.get(groupKey);
    // Get chart type - prefer series type, then calculated value type (for mixed bar/line charts)
    const datasetChartType = seriesChartTypeMap.get(groupKey) || calcValueChartTypeMap.get(groupKey);

    const dataset = {
      label: groupKey,
      data: values,
      backgroundColor: color,
      borderColor: color.replace('0.8', '1'),
      borderWidth: 1,
      yAxisID: (seriesSecondaryYAxisMap.get(groupKey) || calcValueSecondaryYAxisMap.get(groupKey)) ? 'y1' : 'y',
      type: datasetChartType || undefined,
      lineStyle: lineStyle || undefined,
      barStyle: barStyle || undefined,
      strokeWidth: strokeWidth ?? undefined,
    };

    return dataset;
  });

  // Calculate date range info for tick formatting
  let dateAxisInfo = null;
  if (isDateAxis && !hasNonDateAxisValue && sortedXKeys.length > 0) {
    const firstTimestamp = sortedXKeys[0];
    const lastTimestamp = sortedXKeys[sortedXKeys.length - 1];
    const timespanMs = lastTimestamp - firstTimestamp;
    const timespanHours = timespanMs / (1000 * 60 * 60);
    dateAxisInfo = {
      isDateAxis: true,
      timespanHours,
      rawXValues: sortedXKeys, // timestamps
    };
  }

  return {
    labels: sortedXLabels,
    datasets,
    dateAxisInfo,
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

  const { chartType, xColumn, yColumn, series, calculatedValues } = config;

  if (!chartType) {
    return { isValid: false, error: 'Chart type is required' };
  }

  // Check for series - a series with at least one field
  const hasSeries = Array.isArray(series) && series.length > 0 && series.some(s => {
    const fields = s.fields || [];
    return fields.length > 0;
  });
  const hasCalculatedValues = calculatedValues && Array.isArray(calculatedValues) && calculatedValues.length > 0;
  const hasValuesToDisplay = hasSeries || hasCalculatedValues;

  // Check required columns based on chart type
  switch (chartType) {
    case 'scatter':
      if (!xColumn || !yColumn) {
        return { isValid: false, error: 'Scatter plots require both X and Y axis columns' };
      }
      if (!columns || !columns[xColumn] || !columns[yColumn]) {
        return { isValid: false, error: 'Selected columns do not exist' };
      }
      break;

    case 'pie':
    case 'doughnut': {
      if (!hasValuesToDisplay) {
        return { isValid: false, error: 'Pie charts require at least one series or calculated value' };
      }
      // Validate all series fields exist
      if (hasSeries && columns) {
        for (const s of series) {
          const fields = s.fields || [];
          for (const col of fields) {
            if (!columns[col]) {
              return { isValid: false, error: `Field '${col}' does not exist` };
            }
          }
        }
      }
      break;
    }

    case 'bar':
    case 'line':
    case 'radar': {
      if (!xColumn || !hasValuesToDisplay) {
        return { isValid: false, error: 'Bar/line charts require both X axis and at least one series or calculated value' };
      }
      if (!columns || !columns[xColumn]) {
        return { isValid: false, error: 'X column does not exist' };
      }
      // Validate all series fields exist
      if (hasSeries && columns) {
        for (const s of series) {
          const fields = s.fields || [];
          for (const col of fields) {
            if (!columns[col]) {
              return { isValid: false, error: `Field '${col}' does not exist` };
            }
          }
        }
      }
      break;
    }

    default:
      return { isValid: false, error: 'Unsupported chart type' };
  }

  return { isValid: true };
}
