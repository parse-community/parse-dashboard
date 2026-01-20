/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  evaluateFormula,
  validateFormula,
  getFormulaVariables,
  buildVariables,
} from '../FormulaEvaluator';

describe('FormulaEvaluator', () => {
  describe('buildVariables', () => {
    it('should build variables object from field values', () => {
      const fieldValues = {
        price: 10,
        quantity: 5,
        total: 100,
      };
      const result = buildVariables(fieldValues);

      expect(result.price).toBe(10);
      expect(result.quantity).toBe(5);
      expect(result.total).toBe(100);
    });

    it('should create $-prefixed versions of all variables', () => {
      const fieldValues = {
        price: 10,
        round: 5,
      };
      const result = buildVariables(fieldValues);

      // Plain field names
      expect(result.price).toBe(10);
      expect(result.round).toBe(5);
      // $-prefixed versions
      expect(result.$price).toBe(10);
      expect(result.$round).toBe(5);
    });

    it('should convert non-numeric values to 0', () => {
      const fieldValues = {
        numeric: 42,
        string: 'hello',
        nullVal: null,
      };
      const result = buildVariables(fieldValues);

      expect(result.numeric).toBe(42);
      expect(result.string).toBe(0);
      expect(result.nullVal).toBe(0);
      // $-prefixed versions too
      expect(result.$numeric).toBe(42);
      expect(result.$string).toBe(0);
      expect(result.$nullVal).toBe(0);
    });
  });

  describe('evaluateFormula', () => {
    it('should return null for empty formula', () => {
      expect(evaluateFormula('', { x: 10 })).toBe(null);
      expect(evaluateFormula(null, { x: 10 })).toBe(null);
      expect(evaluateFormula(undefined, { x: 10 })).toBe(null);
      expect(evaluateFormula('   ', { x: 10 })).toBe(null);
    });

    it('should evaluate basic arithmetic', () => {
      expect(evaluateFormula('x + y', { x: 10, y: 5 })).toBe(15);
      expect(evaluateFormula('x - y', { x: 10, y: 5 })).toBe(5);
      expect(evaluateFormula('x * y', { x: 10, y: 5 })).toBe(50);
      expect(evaluateFormula('x / y', { x: 10, y: 5 })).toBe(2);
    });

    it('should evaluate complex expressions', () => {
      expect(evaluateFormula('(x + y) * 2', { x: 10, y: 5 })).toBe(30);
      expect(evaluateFormula('x * y + z', { x: 2, y: 3, z: 4 })).toBe(10);
    });

    it('should evaluate power operator', () => {
      expect(evaluateFormula('x ^ 2', { x: 3 })).toBe(9);
      expect(evaluateFormula('2 ^ 3', {})).toBe(8);
    });

    it('should evaluate modulo operator', () => {
      expect(evaluateFormula('x % y', { x: 10, y: 3 })).toBe(1);
    });

    describe('math functions', () => {
      it('should evaluate round function', () => {
        expect(evaluateFormula('round(x, 2)', { x: 3.14159 })).toBe(3.14);
        expect(evaluateFormula('round(x)', { x: 3.7 })).toBe(4);
      });

      it('should evaluate floor function', () => {
        expect(evaluateFormula('floor(x)', { x: 3.7 })).toBe(3);
        expect(evaluateFormula('floor(x)', { x: -3.2 })).toBe(-4);
      });

      it('should evaluate ceil function', () => {
        expect(evaluateFormula('ceil(x)', { x: 3.2 })).toBe(4);
        expect(evaluateFormula('ceil(x)', { x: -3.7 })).toBe(-3);
      });

      it('should evaluate abs function', () => {
        expect(evaluateFormula('abs(x)', { x: -5 })).toBe(5);
        expect(evaluateFormula('abs(x)', { x: 5 })).toBe(5);
      });

      it('should evaluate min function', () => {
        expect(evaluateFormula('min(x, y)', { x: 10, y: 5 })).toBe(5);
        expect(evaluateFormula('min(x, y, z)', { x: 10, y: 5, z: 3 })).toBe(3);
      });

      it('should evaluate max function', () => {
        expect(evaluateFormula('max(x, y)', { x: 10, y: 5 })).toBe(10);
        expect(evaluateFormula('max(x, y, z)', { x: 10, y: 5, z: 15 })).toBe(15);
      });

      it('should evaluate sqrt function', () => {
        expect(evaluateFormula('sqrt(x)', { x: 16 })).toBe(4);
        expect(evaluateFormula('sqrt(x)', { x: 2 })).toBeCloseTo(1.414, 3);
      });

      it('should evaluate log functions', () => {
        expect(evaluateFormula('log10(x)', { x: 100 })).toBe(2);
        expect(evaluateFormula('log(x)', { x: Math.E })).toBeCloseTo(1, 5);
      });

      it('should evaluate trunc function', () => {
        expect(evaluateFormula('trunc(x)', { x: 3.7 })).toBe(3);
        expect(evaluateFormula('trunc(x)', { x: -3.7 })).toBe(-3);
      });

      it('should evaluate sign function', () => {
        expect(evaluateFormula('sign(x)', { x: 5 })).toBe(1);
        expect(evaluateFormula('sign(x)', { x: -5 })).toBe(-1);
        expect(evaluateFormula('sign(x)', { x: 0 })).toBe(0);
      });
    });

    describe('comparison and conditional', () => {
      it('should evaluate comparison operators', () => {
        expect(evaluateFormula('x > y', { x: 10, y: 5 })).toBe(1);
        expect(evaluateFormula('x < y', { x: 10, y: 5 })).toBe(0);
        expect(evaluateFormula('x >= y', { x: 5, y: 5 })).toBe(1);
        expect(evaluateFormula('x == y', { x: 5, y: 5 })).toBe(1);
        expect(evaluateFormula('x != y', { x: 5, y: 3 })).toBe(1);
      });

      it('should evaluate ternary operator', () => {
        expect(evaluateFormula('x > 50 ? 100 : 0', { x: 75 })).toBe(100);
        expect(evaluateFormula('x > 50 ? 100 : 0', { x: 25 })).toBe(0);
        expect(evaluateFormula('x > 0 ? x : 0', { x: -10 })).toBe(0);
      });
    });

    describe('error handling', () => {
      it('should return null for division by zero', () => {
        expect(evaluateFormula('x / 0', { x: 10 })).toBe(null);
      });

      it('should return null for invalid syntax', () => {
        expect(evaluateFormula('x +', { x: 10 })).toBe(null);
        expect(evaluateFormula('invalid syntax !!!', { x: 10 })).toBe(null);
      });

      it('should return null for undefined variables', () => {
        expect(evaluateFormula('unknownVar * 2', {})).toBe(null);
      });

      it('should return null for NaN results', () => {
        expect(evaluateFormula('sqrt(x)', { x: -1 })).toBe(null);
      });
    });

    describe('real-world formulas', () => {
      it('should calculate profit margin', () => {
        const formula = 'round((revenue - cost) / revenue * 100, 2)';
        const result = evaluateFormula(formula, { revenue: 1000, cost: 750 });
        expect(result).toBe(25);
      });

      it('should calculate percentage with cap', () => {
        const formula = 'min(round(x / y * 100, 1), 100)';
        expect(evaluateFormula(formula, { x: 80, y: 100 })).toBe(80);
        expect(evaluateFormula(formula, { x: 150, y: 100 })).toBe(100);
      });

      it('should calculate with conditional logic', () => {
        const formula = 'x > 0 ? round(x / y * 100, 2) : 0';
        expect(evaluateFormula(formula, { x: 50, y: 200 })).toBe(25);
        expect(evaluateFormula(formula, { x: -10, y: 200 })).toBe(0);
      });

      it('should allow $-prefixed variables for reserved function names', () => {
        // Field named "round" can be referenced as $round to avoid conflict
        const vars = buildVariables({ round: 5, price: 10 });
        expect(evaluateFormula('round($round, 2)', vars)).toBe(5);
        expect(evaluateFormula('$round * $price', vars)).toBe(50);
      });
    });
  });

  describe('validateFormula', () => {
    it('should accept empty formulas', () => {
      expect(validateFormula('').isValid).toBe(true);
      expect(validateFormula(null).isValid).toBe(true);
      expect(validateFormula('   ').isValid).toBe(true);
    });

    it('should accept valid formulas', () => {
      expect(validateFormula('x * 2', ['x']).isValid).toBe(true);
      expect(validateFormula('round(x, 2)', ['x']).isValid).toBe(true);
      expect(validateFormula('x + y', ['x', 'y']).isValid).toBe(true);
    });

    it('should reject invalid syntax', () => {
      const result = validateFormula('x *', ['x']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject unknown variables', () => {
      const result = validateFormula('unknownVar * 2', ['x', 'y']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('unknownVar');
    });

    it('should accept known field variables', () => {
      const result = validateFormula('price * quantity', ['price', 'quantity']);
      expect(result.isValid).toBe(true);
    });

    it('should accept field names with underscores', () => {
      const result = validateFormula('field_name * 2', ['field_name']);
      expect(result.isValid).toBe(true);
    });

    it('should validate complex formulas', () => {
      const result = validateFormula(
        'round((revenue - cost) / revenue * 100, 2)',
        ['revenue', 'cost']
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept $-prefixed field names', () => {
      const result = validateFormula('$price * $quantity', ['price', 'quantity']);
      expect(result.isValid).toBe(true);
    });

    it('should accept $-prefixed names for reserved function names', () => {
      // Field named "round" can be referenced as $round
      const result = validateFormula('round($round, 2)', ['round']);
      expect(result.isValid).toBe(true);
    });

    it('should reject unknown $-prefixed variables', () => {
      const result = validateFormula('$unknownVar * 2', ['x', 'y']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('$unknownVar');
    });
  });

  describe('getFormulaVariables', () => {
    it('should return empty array for empty formula', () => {
      expect(getFormulaVariables('')).toEqual([]);
      expect(getFormulaVariables(null)).toEqual([]);
    });

    it('should extract variable names', () => {
      const vars = getFormulaVariables('x * 2');
      expect(vars).toContain('x');
    });

    it('should extract multiple variable names', () => {
      const vars = getFormulaVariables('price + quantity');
      expect(vars).toContain('price');
      expect(vars).toContain('quantity');
    });

    it('should not include function names as variables', () => {
      const vars = getFormulaVariables('round(x, 2)');
      expect(vars).toContain('x');
      expect(vars).not.toContain('round');
    });

    it('should handle complex expressions', () => {
      const vars = getFormulaVariables('(a + b) / c * d');
      expect(vars).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']));
    });

    it('should return empty array for invalid formula', () => {
      expect(getFormulaVariables('invalid !!!')).toEqual([]);
    });
  });
});
