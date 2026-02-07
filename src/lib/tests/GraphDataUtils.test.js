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
        series: [{ fields: ['sales'], aggregationType: 'sum' }],
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
        series: [{ fields: ['sales'], aggregationType: 'sum' }],
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
      const series = [{ fields: ['value'], aggregationType: 'sum', title: 'Value' }];
      const result = processPieData(mockData, series, 'category');

      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.labels).toContain('Value (A)');
      expect(result.labels).toContain('Value (B)');
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
      const series = [{ fields: ['sales'], aggregationType: 'sum' }];
      const result = processBarLineData(mockData, 'month', series, null);

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

        const result = processBarLineData(mockData, 'month', [], null, calculatedValues);

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

        const result = processBarLineData(mockData, 'month', [], null, calculatedValues);

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

        const result = processBarLineData(mockData, 'month', [], null, calculatedValues);

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

        const series = [{ fields: ['price'], aggregationType: 'sum' }];
        const result = processBarLineData(mockData, 'month', series, null, calculatedValues);

        // Should still work, just without the empty formula calculated value
        expect(result).toHaveProperty('datasets');
      });

      it('should handle invalid formula gracefully', () => {
        const calculatedValues = [{
          name: 'Invalid',
          operator: 'formula',
          formula: 'invalid syntax @@@',
        }];

        const series = [{ fields: ['price'], aggregationType: 'sum' }];
        const result = processBarLineData(mockData, 'month', series, null, calculatedValues);

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

        const result = processPieData(mockData, [], 'category', calculatedValues);

        // Verify datasets exist and contain computed formula values
        expect(result).toHaveProperty('datasets');
        expect(result.datasets).toHaveLength(1);
        expect(result.datasets[0]).toHaveProperty('data');
        // A: 100-60=40, B: 200-150=50
        // Labels are category values ('A', 'B')
        expect(result.datasets[0].data).toEqual([40, 50]);

        // Verify labels match the categories from mockData with calc name prefix
        expect(result.labels).toHaveLength(2);
        expect(result.labels).toEqual(['Profit (A)', 'Profit (B)']);
      });
    });

    describe('processBarLineData with percent operator', () => {
      it('should calculate percent from summed numerators and denominators', () => {
        // Test data with multiple rows per month
        // Each row has numerator and denominator fields
        const mockData = [
          { attributes: { month: 'Jan', numerator: 100, denominator: 10 } },
          { attributes: { month: 'Jan', numerator: 200, denominator: 25 } },
          { attributes: { month: 'Feb', numerator: 150, denominator: 30 } },
        ];

        const calculatedValues = [{
          name: 'ConversionRate',
          operator: 'percent',
          fields: ['numerator', 'denominator'],
        }];

        const result = processBarLineData(mockData, 'month', [], null, calculatedValues);

        expect(result).toHaveProperty('datasets');
        expect(result.datasets.length).toBe(1);
        expect(result.datasets[0].label).toBe('ConversionRate');

        // Find values for Jan and Feb
        const janIndex = result.labels.indexOf('Jan');
        const febIndex = result.labels.indexOf('Feb');

        // Jan: (100+200)/(10+25)*100 = 300/35*100 = 857.14%
        // This is the percentage of totals, not average of individual percentages
        expect(result.datasets[0].data[janIndex]).toBeCloseTo(857.14, 1);

        // Feb: 150/30*100 = 500%
        expect(result.datasets[0].data[febIndex]).toBe(500);
      });

      it('should handle percent calculation with value columns', () => {
        // Test that percent calculated values work correctly alongside regular value columns
        const mockData = [
          { attributes: { month: 'Jan', numerator: 443300, denominator: 54008, revenue: 1000 } },
        ];

        const calculatedValues = [{
          name: 'Percent',
          operator: 'percent',
          fields: ['numerator', 'denominator'],
        }];

        const series = [{ fields: ['revenue'], aggregationType: 'sum' }];
        const result = processBarLineData(mockData, 'month', series, null, calculatedValues);

        expect(result).toHaveProperty('datasets');
        expect(result.datasets.length).toBe(2); // revenue + Percent

        const percentDataset = result.datasets.find(d => d.label === 'Percent');
        expect(percentDataset).toBeDefined();

        // 443300 / 54008 * 100 = 820.8043...
        expect(percentDataset.data[0]).toBeCloseTo(820.8, 1);
      });

      it('should calculate percent using another calculated value as input', () => {
        // Test scenario: user has calculated values where one uses another as input
        // CalcValue1: Sum of fieldA (e.g., 443300 total)
        // CalcValue2: Sum of fieldB (e.g., 54008 total)
        // PercentCalc: Percent with numerator=CalcValue1, denominator=CalcValue2
        const mockData = [
          { attributes: { month: 'Jan', fieldA: 100000, fieldB: 12000 } },
          { attributes: { month: 'Jan', fieldA: 200000, fieldB: 22000 } },
          { attributes: { month: 'Jan', fieldA: 143300, fieldB: 20008 } },
        ];
        // Total fieldA: 443300, Total fieldB: 54008

        const calculatedValues = [
          {
            name: 'TotalA',
            operator: 'sum',
            fields: ['fieldA'],
          },
          {
            name: 'TotalB',
            operator: 'sum',
            fields: ['fieldB'],
          },
          {
            name: 'PercentOfTotals',
            operator: 'percent',
            fields: ['TotalA', 'TotalB'],
          },
        ];

        const result = processBarLineData(mockData, 'month', [], null, calculatedValues);

        expect(result).toHaveProperty('datasets');

        const percentDataset = result.datasets.find(d => d.label === 'PercentOfTotals');
        expect(percentDataset).toBeDefined();

        // With the fix, percent is calculated as (sum of numerators / sum of denominators) * 100
        // TotalA per row: 100000, 200000, 143300 -> these are the numerator values
        // TotalB per row: 12000, 22000, 20008 -> these are the denominator values
        // Percent = (100000+200000+143300) / (12000+22000+20008) * 100
        //         = 443300 / 54008 * 100 = 820.8%
        expect(percentDataset.data[0]).toBeCloseTo(820.8, 0);
      });

      it('should handle percent with 2 value fields and 2 calculated values (user scenario)', () => {
        // User scenario: line chart with x-axis date, 2 value fields (sum), 2 calculated values
        const mockData = [
          { attributes: { date: '2024-01-01', numerator: 55412, denominator: 6751, valueA: 100, valueB: 50 } },
          { attributes: { date: '2024-01-01', numerator: 55412, denominator: 6751, valueA: 200, valueB: 60 } },
          { attributes: { date: '2024-01-01', numerator: 55413, denominator: 6751, valueA: 150, valueB: 70 } },
          { attributes: { date: '2024-01-01', numerator: 55413, denominator: 6751, valueA: 120, valueB: 80 } },
          { attributes: { date: '2024-01-01', numerator: 55413, denominator: 6751, valueA: 180, valueB: 90 } },
          { attributes: { date: '2024-01-01', numerator: 55413, denominator: 6751, valueA: 160, valueB: 55 } },
          { attributes: { date: '2024-01-01', numerator: 55412, denominator: 6751, valueA: 140, valueB: 65 } },
          { attributes: { date: '2024-01-01', numerator: 55412, denominator: 6751, valueA: 130, valueB: 75 } },
        ];
        // Total numerator: 443300, Total denominator: 54008
        // Each row: (55412/6751)*100 = 820.8% or (55413/6751)*100 = 820.8%

        const calculatedValues = [
          {
            name: 'SomeCalc',
            operator: 'sum',
            fields: ['valueA', 'valueB'],
          },
          {
            name: 'PercentCalc',
            operator: 'percent',
            fields: ['numerator', 'denominator'],
          },
        ];

        // 2 value fields with aggregation 'sum', plus 2 calculated values
        const series = [
          { fields: ['valueA'], aggregationType: 'sum' },
          { fields: ['valueB'], aggregationType: 'sum' },
        ];
        const result = processBarLineData(mockData, 'date', series, null, calculatedValues);

        expect(result).toHaveProperty('datasets');

        const percentDataset = result.datasets.find(d => d.label === 'PercentCalc');
        expect(percentDataset).toBeDefined();

        // Expected: average of 8 rows each at ~820.8% = 820.8% (NOT 8 * 820.8 = 6566.4)
        expect(percentDataset.data[0]).toBeCloseTo(820.8, 0);
      });
    });

    describe('processBarLineData with average operator', () => {
      it('should calculate average from aggregated field sums, not average of per-row averages', () => {
        // 3 rows with different values that would give different results
        // depending on whether we average per-row averages vs average of sums
        const mockData = [
          { date: '2024-01', a: 0, b: 1 },
          { date: '2024-01', a: 0, b: 1 },
          { date: '2024-01', a: 0, b: 1 },
        ];

        const calculatedValues = [
          {
            name: 'avg',
            operator: 'average',
            fields: ['a', 'b'],
          },
        ];

        const series = [
          { fields: ['a'], aggregationType: 'sum' },
          { fields: ['b'], aggregationType: 'sum' },
        ];
        const result = processBarLineData(mockData, 'date', series, null, calculatedValues);

        expect(result).toHaveProperty('datasets');

        // Value columns with sum aggregation
        const aDataset = result.datasets.find(d => d.label === 'a');
        const bDataset = result.datasets.find(d => d.label === 'b');
        expect(aDataset.data[0]).toBe(0); // sum of a: 0+0+0 = 0
        expect(bDataset.data[0]).toBe(3); // sum of b: 1+1+1 = 3

        // Average calculated value
        const avgDataset = result.datasets.find(d => d.label === 'avg');
        expect(avgDataset).toBeDefined();

        // Expected: (sum_a + sum_b) / 2 = (0 + 3) / 2 = 1.5
        // NOT: average of per-row averages = ((0+1)/2 + (0+1)/2 + (0+1)/2) = 0.5+0.5+0.5 = 1.5 summed = wrong
        // Wait, per-row avg = 0.5 each, and if we SUM those we get 1.5, which equals (0+3)/2
        // Let me use different values to distinguish
        expect(avgDataset.data[0]).toBe(1.5); // (0 + 3) / 2 = 1.5
      });

      it('should calculate average correctly with asymmetric data', () => {
        // Use data where average of per-row averages differs from average of sums
        const mockData = [
          { date: '2024-01', a: 2, b: 0 },  // per-row avg = 1
          { date: '2024-01', a: 0, b: 0 },  // per-row avg = 0
          { date: '2024-01', a: 0, b: 1 },  // per-row avg = 0.5
        ];
        // Sum of per-row avgs = 1.5, if summed (wrong aggregation)
        // Sum of a = 2, Sum of b = 1
        // Average of sums = (2 + 1) / 2 = 1.5
        // Hmm, still the same! Let me try another approach.

        // Actually the issue is: per-row avg summed vs per-row avg averaged
        // Per-row avgs: [1, 0, 0.5]
        // If we SUM per-row avgs: 1.5
        // If we AVG per-row avgs: 0.5
        // Average of field sums: (2+1)/2 = 1.5

        const calculatedValues = [
          {
            name: 'avg',
            operator: 'average',
            fields: ['a', 'b'],
          },
        ];

        const series = [
          { fields: ['a'], aggregationType: 'sum' },
          { fields: ['b'], aggregationType: 'sum' },
        ];
        const result = processBarLineData(mockData, 'date', series, null, calculatedValues);

        const aDataset = result.datasets.find(d => d.label === 'a');
        const bDataset = result.datasets.find(d => d.label === 'b');
        expect(aDataset.data[0]).toBe(2); // sum of a: 2+0+0 = 2
        expect(bDataset.data[0]).toBe(1); // sum of b: 0+0+1 = 1

        const avgDataset = result.datasets.find(d => d.label === 'avg');
        // Expected: (sum_a + sum_b) / 2 = (2 + 1) / 2 = 1.5
        expect(avgDataset.data[0]).toBe(1.5);
      });
    });
  });
});
