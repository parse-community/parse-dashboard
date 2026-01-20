/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Parser } from 'expr-eval-fork';

// Create parser with safe configuration
const parser = new Parser({
  operators: {
    // Arithmetic operators
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    remainder: true,
    power: true,

    // Comparison operators
    comparison: true,

    // Logical operators
    logical: true,

    // Conditional (ternary) operator
    conditional: true,

    // Disable potentially dangerous or unnecessary operators
    concatenate: false,
    factorial: false,
    assignment: false,
    fndef: false,
    in: false,

    // Math functions - enable useful ones
    sin: false,
    cos: false,
    tan: false,
    asin: false,
    acos: false,
    atan: false,
    sinh: false,
    cosh: false,
    tanh: false,
    asinh: false,
    acosh: false,
    atanh: false,
    sqrt: true,
    cbrt: true,
    log: true,
    log2: true,
    ln: true,
    lg: true,
    log10: true,
    expm1: true,
    log1p: true,
    abs: true,
    ceil: true,
    floor: true,
    round: true,
    trunc: true,
    exp: true,
    sign: true,
    length: false,
    random: false,
    min: true,
    max: true,
  },
});

/**
 * Pre-process a formula to convert user-friendly syntax to expr-eval compatible syntax.
 * - Converts round(value, decimals) to roundTo(value, decimals)
 * @param {string} formula - The formula to pre-process
 * @returns {string} The processed formula
 */
function preprocessFormula(formula) {
  if (!formula) {return formula;}

  // Replace round(x, n) with roundTo(x, n) - supports round with 2 args
  // This regex matches round( followed by content that ends with , number )
  // We need to be careful not to replace round(x) which should stay as round(x)
  let processed = formula;

  // Replace round(expr, decimals) with roundTo(expr, decimals)
  // Use a more careful approach: find round( and check if there's a comma before the closing paren
  processed = processed.replace(/\bround\s*\(/g, (match, offset) => {
    // Look ahead to see if this is round(x, n) or round(x)
    const rest = formula.slice(offset + match.length);
    // Count parentheses to find the matching closing paren
    let depth = 1;
    let hasComma = false;
    for (let i = 0; i < rest.length && depth > 0; i++) {
      if (rest[i] === '(') {depth++;}
      else if (rest[i] === ')') {depth--;}
      else if (rest[i] === ',' && depth === 1) {hasComma = true;}
    }
    return hasComma ? 'roundTo(' : 'round(';
  });

  return processed;
}

/**
 * Build a variables object from field values.
 * Creates both plain field names and $-prefixed versions for each field.
 * The $-prefixed version allows explicit field reference when field names
 * conflict with reserved function names (e.g., $round for a field named "round").
 * @param {Object} fieldValues - Object mapping field names to their values
 * @returns {Object} Object with field names as keys and numeric values
 */
export function buildVariables(fieldValues) {
  const variables = {};
  for (const [key, value] of Object.entries(fieldValues)) {
    if (key) {
      const numericValue = typeof value === 'number' ? value : 0;
      // Add plain field name
      variables[key] = numericValue;
      // Add $-prefixed version for explicit field reference
      variables[`$${key}`] = numericValue;
    }
  }
  return variables;
}

/**
 * Evaluate a formula with given variables
 * @param {string} formula - The formula string to evaluate
 * @param {Object} variables - Object containing variable names and values
 * @returns {number|null} The evaluated result or null on error
 */
export function evaluateFormula(formula, variables) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return null;
  }

  try {
    const processedFormula = preprocessFormula(formula);
    const expr = parser.parse(processedFormula);
    let result = expr.evaluate(variables);

    // Convert boolean results to numbers (for comparison operators)
    if (typeof result === 'boolean') {
      result = result ? 1 : 0;
    }

    // Ensure we return a valid number
    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }

    return result;
  } catch (error) {
    console.warn('Formula evaluation error:', error.message);
    return null;
  }
}

/**
 * Validate a formula string
 * @param {string} formula - The formula to validate
 * @param {Array<string>} availableVariables - List of available variable names
 * @returns {Object} Validation result with isValid and error properties
 */
export function validateFormula(formula, availableVariables = []) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return { isValid: true, error: null };
  }

  try {
    const processedFormula = preprocessFormula(formula);
    const expr = parser.parse(processedFormula);
    const usedVariables = expr.variables();

    // Build set of available variables including $-prefixed versions
    const availableSet = new Set(availableVariables);
    availableVariables.forEach(v => availableSet.add(`$${v}`));

    const unknownVars = usedVariables.filter(v => !availableSet.has(v));
    if (unknownVars.length > 0) {
      return {
        isValid: false,
        error: `Unknown variable(s): ${unknownVars.join(', ')}`,
      };
    }

    // Test evaluation with dummy values to ensure formula is executable
    const testVars = {};
    availableSet.forEach(v => {
      testVars[v] = 1;
    });
    expr.evaluate(testVars);

    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

/**
 * Get list of variables used in a formula
 * @param {string} formula - The formula to analyze
 * @returns {Array<string>} List of variable names
 */
export function getFormulaVariables(formula) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return [];
  }

  try {
    const processedFormula = preprocessFormula(formula);
    const expr = parser.parse(processedFormula);
    return expr.variables();
  } catch {
    return [];
  }
}
