/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('BrowserFilter - Legacy Filter Normalization', () => {
  // Function to normalize filters (same logic as in BrowserFilter)
  function normalizeFilters(filters, className) {
    return filters.map(filter => {
      const normalizedFilter = { ...filter };
      if (normalizedFilter.class === className) {
        delete normalizedFilter.class;
      }
      return normalizedFilter;
    });
  }

  describe('filter normalization for legacy support', () => {
    it('should normalize filters by removing class property that matches current className', () => {
      const filtersWithClass = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA', class: 'MyClass' },
        { field: 'fieldB', constraint: 'eq', compareTo: 'valueB', class: 'MyClass' }
      ];

      const filtersWithoutClass = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA' },
        { field: 'fieldB', constraint: 'eq', compareTo: 'valueB' }
      ];

      const normalizedWithClass = normalizeFilters(filtersWithClass, 'MyClass');
      const normalizedWithoutClass = normalizeFilters(filtersWithoutClass, 'MyClass');

      expect(JSON.stringify(normalizedWithClass)).toBe(JSON.stringify(normalizedWithoutClass));
      expect(JSON.stringify(normalizedWithClass)).toBe(JSON.stringify(filtersWithoutClass));
    });

    it('should not remove class property that differs from current className', () => {
      const filtersWithDifferentClass = [
        { field: 'name', constraint: 'eq', compareTo: 'test', class: '_User' }
      ];

      const normalized = normalizeFilters(filtersWithDifferentClass, 'MyClass');

      expect(normalized[0].class).toBe('_User');
      expect(JSON.stringify(normalized)).toBe(JSON.stringify(filtersWithDifferentClass));
    });

    it('should handle filters without class property', () => {
      const filtersWithoutClass = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA' },
        { field: 'fieldB', constraint: 'eq', compareTo: 'valueB' }
      ];

      const normalized = normalizeFilters(filtersWithoutClass, 'MyClass');

      expect(JSON.stringify(normalized)).toBe(JSON.stringify(filtersWithoutClass));
    });

    it('should handle complex filters with dates', () => {
      const filtersWithDates = [
        {
          field: 'createdAt',
          constraint: 'after',
          compareTo: { __type: 'Date', iso: '2023-11-18T00:00:00.000Z' },
          class: 'MyClass'
        }
      ];

      const expectedNormalized = [
        {
          field: 'createdAt',
          constraint: 'after',
          compareTo: { __type: 'Date', iso: '2023-11-18T00:00:00.000Z' }
        }
      ];

      const normalized = normalizeFilters(filtersWithDates, 'MyClass');

      expect(JSON.stringify(normalized)).toBe(JSON.stringify(expectedNormalized));
    });

    it('should match normalized filters', () => {
      // This is the exact filter from the broken URL
      const originalLegacyFilter = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA' },
        { field: 'fieldB', constraint: 'eq', compareTo: 'valueB' },
        {
          field: 'createdAt',
          constraint: 'after',
          compareTo: { __type: 'Date', iso: '2023-11-18T00:00:00.000Z' }
        }
      ];

      // This is what extractFiltersFromQuery creates (with class property added)
      const processedFilter = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA', class: 'MyClass' },
        { field: 'fieldB', constraint: 'eq', compareTo: 'valueB', class: 'MyClass' },
        {
          field: 'createdAt',
          constraint: 'after',
          compareTo: { __type: 'Date', iso: '2023-11-18T00:00:00.000Z' },
          class: 'MyClass'
        }
      ];

      // Without normalization, these don't match
      expect(JSON.stringify(originalLegacyFilter)).not.toBe(JSON.stringify(processedFilter));

      // With normalization, they should match
      const normalizedOriginal = normalizeFilters(originalLegacyFilter, 'MyClass');
      const normalizedProcessed = normalizeFilters(processedFilter, 'MyClass');

      expect(JSON.stringify(normalizedOriginal)).toBe(JSON.stringify(normalizedProcessed));
      expect(JSON.stringify(normalizedOriginal)).toBe(JSON.stringify(originalLegacyFilter));
    });

    it('should handle the working filter', () => {
      // This is the filter from the working URL (already has class property)
      const workingFilter = [
        { class: 'MyClass', field: 'fieldA', constraint: 'eq', compareTo: 'valueA' }
      ];

      // When processed, it should remain the same since it already has the correct class
      const processedWorkingFilter = [
        { class: 'MyClass', field: 'fieldA', constraint: 'eq', compareTo: 'valueA' }
      ];

      // With normalization, both should normalize to the same thing
      const normalizedWorking = normalizeFilters(workingFilter, 'MyClass');
      const normalizedProcessed = normalizeFilters(processedWorkingFilter, 'MyClass');

      expect(JSON.stringify(normalizedWorking)).toBe(JSON.stringify(normalizedProcessed));

      // Both should normalize to the version without class property
      const expectedNormalized = [
        { field: 'fieldA', constraint: 'eq', compareTo: 'valueA' }
      ];

      expect(JSON.stringify(normalizedWorking)).toBe(JSON.stringify(expectedNormalized));
    });
  });
});
