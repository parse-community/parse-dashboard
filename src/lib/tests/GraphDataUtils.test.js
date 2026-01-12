/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  getNestedValue,
  isNumeric,
  aggregateValues,
  validateGraphConfig,
  processScatterData,
  processPieData,
  processBarLineData,
} from '../GraphDataUtils';

describe('GraphDataUtils', () => {
  describe('getNestedValue', () => {
    it('should return simple property values', () => {
      const obj = { name: 'John', age: 30 };
      expect(getNestedValue(obj, 'name')).toBe('John');
      expect(getNestedValue(obj, 'age')).toBe(30);
    });

    it('should return nested property values', () => {
      const obj = { user: { profile: { name: 'John' } } };
      expect(getNestedValue(obj, 'user.profile.name')).toBe('John');
    });

    it('should handle Parse object attributes', () => {
      const obj = {
        attributes: { name: 'John', age: 30 },
        id: '123'
      };
      expect(getNestedValue(obj, 'name')).toBe('John');
      expect(getNestedValue(obj, 'age')).toBe(30);
    });

    it('should return null for non-existent paths', () => {
      const obj = { name: 'John' };
      expect(getNestedValue(obj, 'nonexistent')).toBe(null);
      expect(getNestedValue(obj, 'user.name')).toBe(null);
    });
  });

  describe('isNumeric', () => {
    it('should identify numeric values', () => {
      expect(isNumeric(42)).toBe(true);
      expect(isNumeric(3.14)).toBe(true);
      expect(isNumeric('42')).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
      expect(isNumeric(NaN)).toBe(false);
    });
  });

  describe('aggregateValues', () => {
    it('should calculate sum', () => {
      expect(aggregateValues([1, 2, 3, 4], 'sum')).toBe(10);
    });

    it('should calculate average', () => {
      expect(aggregateValues([1, 2, 3, 4], 'avg')).toBe(2.5);
    });

    it('should calculate count', () => {
      expect(aggregateValues([1, 2, 3, 4], 'count')).toBe(4);
    });

    it('should handle empty arrays', () => {
      expect(aggregateValues([], 'sum')).toBe(0);
      expect(aggregateValues([], 'count')).toBe(0);
    });
  });

  describe('validateGraphConfig', () => {
    it('should validate bar chart configuration', () => {
      const config = {
        chartType: 'bar',
        xColumn: 'category',
        valueColumn: 'sales',
      };
      const columns = { category: { type: 'String' }, sales: { type: 'Number' } };

      expect(validateGraphConfig(config, columns).isValid).toBe(true);
    });

    it('should reject invalid chart types', () => {
      const config = { chartType: 'invalid' };
      expect(validateGraphConfig(config, {}).isValid).toBe(false);
    });

    it('should reject scatter plots without Y column', () => {
      const config = {
        chartType: 'scatter',
        xColumn: 'x',
        // missing yColumn
      };
      expect(validateGraphConfig(config, {}).isValid).toBe(false);
    });

    it('should handle empty columns object gracefully', () => {
      const config = {
        chartType: 'bar',
        xColumn: 'category',
        valueColumn: 'sales',
      };

      expect(validateGraphConfig(config, null).isValid).toBe(false);
      expect(validateGraphConfig(config, undefined).isValid).toBe(false);
    });
  });

  describe('processScatterData', () => {
    const mockData = [
      { attributes: { x: 1, y: 2 } },
      { attributes: { x: 3, y: 4 } },
      { attributes: { x: 5, y: 6 } },
    ];

    it('should process scatter data correctly', () => {
      const result = processScatterData(mockData, 'x', 'y');

      expect(result).toHaveProperty('datasets');
      expect(result.datasets[0].data).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ]);
    });

    it('should return null for invalid data', () => {
      const result = processScatterData(mockData, 'nonexistent', 'y');
      expect(result).toBe(null);
    });
  });

  describe('processPieData', () => {
    const mockData = [
      { attributes: { category: 'A', value: 10 } },
      { attributes: { category: 'A', value: 20 } },
      { attributes: { category: 'B', value: 30 } },
    ];

    it('should process pie data with grouping', () => {
      const result = processPieData(mockData, 'value', 'category', 'sum');

      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.labels).toContain('A');
      expect(result.labels).toContain('B');
      expect(result.datasets[0].data).toContain(30); // A: 10 + 20
      expect(result.datasets[0].data).toContain(30); // B: 30
    });
  });

  describe('processBarLineData', () => {
    const mockData = [
      { attributes: { month: 'Jan', sales: 100 } },
      { attributes: { month: 'Jan', sales: 200 } },
      { attributes: { month: 'Feb', sales: 150 } },
    ];

    it('should process bar/line data correctly', () => {
      const result = processBarLineData(mockData, 'month', 'sales', null, 'sum');

      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.labels).toContain('Jan');
      expect(result.labels).toContain('Feb');
    });
  });
});
