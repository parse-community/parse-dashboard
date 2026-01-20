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

  describe('formula operator', () => {
    describe('processBarLineData with formula', () => {
      const mockData = [
        { attributes: { month: 'Jan', price: 10, quantity: 5 } },
        { attributes: { month: 'Feb', price: 20, quantity: 3 } },
        { attributes: { month: 'Mar', price: 15, quantity: 4 } },
      ];

      it('should evaluate formula with field references', () => {
        const calculatedValues = [{
          name: 'Total',
          operator: 'formula',
          formula: 'price * quantity',
        }];

        const result = processBarLineData(mockData, 'month', null, null, 'sum', calculatedValues);

        expect(result).toHaveProperty('datasets');
        expect(result.datasets.length).toBe(1);
        expect(result.datasets[0].label).toBe('Total');
        // Jan: 10*5=50, Feb: 20*3=60, Mar: 15*4=60
        expect(result.datasets[0].data).toContain(50);
        expect(result.datasets[0].data).toContain(60);
      });

      it('should evaluate formula with math functions', () => {
        const calculatedValues = [{
          name: 'Rounded',
          operator: 'formula',
          formula: 'round(price / quantity, 2)',
        }];

        const result = processBarLineData(mockData, 'month', null, null, 'sum', calculatedValues);

        expect(result).toHaveProperty('datasets');
        expect(result.datasets[0].label).toBe('Rounded');
        // Jan: round(10/5, 2)=2, Feb: round(20/3, 2)=6.67, Mar: round(15/4, 2)=3.75
        expect(result.datasets[0].data).toContain(2);
      });

      it('should reference previous calculated values in formula', () => {
        const calculatedValues = [
          {
            name: 'Revenue',
            operator: 'sum',
            fields: ['price', 'quantity'],
          },
          {
            name: 'Adjusted',
            operator: 'formula',
            formula: 'Revenue * 2',
          },
        ];

        const result = processBarLineData(mockData, 'month', null, null, 'sum', calculatedValues);

        expect(result).toHaveProperty('datasets');
        expect(result.datasets.length).toBe(2);
        // Revenue for Jan: 10+5=15, Adjusted: 15*2=30
        const adjustedDataset = result.datasets.find(d => d.label === 'Adjusted');
        expect(adjustedDataset).toBeDefined();
        expect(adjustedDataset.data).toContain(30);
      });

      it('should handle empty formula gracefully', () => {
        const calculatedValues = [{
          name: 'Empty',
          operator: 'formula',
          formula: '',
        }];

        const result = processBarLineData(mockData, 'month', 'price', null, 'sum', calculatedValues);

        // Should still work, just without the empty formula calculated value
        expect(result).toHaveProperty('datasets');
      });

      it('should handle invalid formula gracefully', () => {
        const calculatedValues = [{
          name: 'Invalid',
          operator: 'formula',
          formula: 'invalid syntax @@@',
        }];

        const result = processBarLineData(mockData, 'month', 'price', null, 'sum', calculatedValues);

        // Should not throw, chart should render with regular values
        expect(result).toHaveProperty('datasets');
      });
    });

    describe('processPieData with formula', () => {
      const mockData = [
        { attributes: { category: 'A', revenue: 100, cost: 60 } },
        { attributes: { category: 'B', revenue: 200, cost: 150 } },
      ];

      it('should evaluate formula in pie chart', () => {
        const calculatedValues = [{
          name: 'Profit',
          operator: 'formula',
          formula: 'revenue - cost',
        }];

        const result = processPieData(mockData, null, 'category', 'sum', calculatedValues);

        // Verify datasets exist and contain computed formula values
        expect(result).toHaveProperty('datasets');
        expect(result.datasets).toHaveLength(1);
        expect(result.datasets[0]).toHaveProperty('data');
        // A: 100-60=40, B: 200-150=50
        // Labels are category values ('A', 'B')
        expect(result.datasets[0].data).toEqual([40, 50]);

        // Verify labels match the categories from mockData
        expect(result.labels).toHaveLength(2);
        expect(result.labels).toEqual(['A', 'B']);
      });
    });
  });
});
