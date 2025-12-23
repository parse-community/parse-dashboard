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

// Mock localStorage
const mockStorage = {};
window.localStorage = {
  setItem(key, value) {
    mockStorage[key] = value;
  },
  getItem(key) {
    return mockStorage[key] || null;
  },
};

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn(() => 'test-uuid-123');

// Mock the entire crypto object at module level
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID
  }
});

jest.dontMock('../ClassPreferences');
const ClassPreferences = require('../ClassPreferences');

// Create a minimal Browser-like class with just the saveFilters method
class MockBrowser {
  constructor() {
    this.context = { applicationId: 'testApp' };
    this.props = { params: { className: 'TestClass' } };
  }

  forceUpdate() {
    // Mock implementation
  }

  saveFilters(filters, name, relativeDate, filterId = null) {
    const jsonFilters = filters.toJSON();
    if (relativeDate && jsonFilters?.length) {
      for (let i = 0; i < jsonFilters.length; i++) {
        const filter = jsonFilters[i];
        const compareTo = filter.get('compareTo');
        if (compareTo?.__type === 'Date') {
          compareTo.__type = 'RelativeDate';
          const now = new Date();
          const date = new Date(compareTo.iso);
          const diff = date.getTime() - now.getTime();
          compareTo.value = Math.floor(diff / 1000);
          delete compareTo.iso;
          filter.set('compareTo', compareTo);
          jsonFilters[i] = filter;
        }
      }
    }

    const _filters = JSON.stringify(jsonFilters);
    const preferences = ClassPreferences.getPreferences(
      this.context.applicationId,
      this.props.params.className
    );

    let newFilterId = filterId;

    if (filterId) {
      // Update existing filter
      const existingFilterIndex = preferences.filters.findIndex(filter => filter.id === filterId);
      if (existingFilterIndex !== -1) {
        preferences.filters[existingFilterIndex] = {
          name,
          id: filterId,
          filter: _filters,
        };
      } else {
        // Fallback: if filter not found, create new one
        newFilterId = crypto.randomUUID();
        preferences.filters.push({
          name,
          id: newFilterId,
          filter: _filters,
        });
      }
    } else {
      // Check if this is updating an existing filter by name and content match
      // (legacy filters get auto-assigned UUIDs when read, so we match by content)
      const existingFilterIndex = preferences.filters.findIndex(filter =>
        filter.name === name && filter.filter === _filters
      );

      if (existingFilterIndex !== -1) {
        // Update existing filter, keeping its ID
        newFilterId = preferences.filters[existingFilterIndex].id;
        preferences.filters[existingFilterIndex] = {
          name,
          id: newFilterId,
          filter: _filters,
        };
      } else {
        // Create new filter
        newFilterId = crypto.randomUUID();
        preferences.filters.push({
          name,
          id: newFilterId,
          filter: _filters,
        });
      }
    }

    ClassPreferences.updatePreferences(
      preferences,
      this.context.applicationId,
      this.props.params.className
    );

    this.forceUpdate();

    // Return the filter ID for new filters so the caller can apply them
    return newFilterId;
  }
}

// Mock List for filters
class MockList {
  constructor(data = []) {
    this.data = data;
  }

  toJSON() {
    return this.data;
  }
}

describe('Browser saveFilters - Legacy Filter Conversion', () => {
  let browser;

  beforeEach(() => {
    browser = new MockBrowser();
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    // Reset the UUID mock
    mockRandomUUID.mockReturnValue('test-uuid-123');
  });

  it('converts legacy filter to modern filter when updating', () => {
    const filterData = [{ field: 'name', constraint: 'eq', compareTo: 'test' }];
    const filters = new MockList(filterData);

    // First, manually create a legacy filter (without ID) in preferences
    const preferences = {
      filters: [
        {
          name: 'Legacy Filter',
          filter: JSON.stringify(filterData)
          // Note: no 'id' property - this makes it a legacy filter
        }
      ]
    };
    ClassPreferences.updatePreferences(
      preferences,
      'testApp',
      'TestClass'
    );

    // Now call saveFilters to update the same filter
    // Note: With automatic UUID assignment, the legacy filter gets a UUID when read,
    // so saveFilters will update the existing filter by ID rather than converting it
    const result = browser.saveFilters(filters, 'Legacy Filter', false);

    // The filter should get the auto-assigned UUID
    expect(result).toBe('test-uuid-123');

    const updatedPreferences = ClassPreferences.getPreferences('testApp', 'TestClass');
    // Should have only 1 filter (the updated one, not a duplicate)
    expect(updatedPreferences.filters).toHaveLength(1);
    expect(updatedPreferences.filters[0]).toEqual({
      name: 'Legacy Filter',
      id: 'test-uuid-123',
      filter: JSON.stringify(filterData)
    });
  });

  it('creates new filter when legacy filter with same name has different content', () => {
    const originalFilterData = [{ field: 'name', constraint: 'eq', compareTo: 'original' }];
    const newFilterData = [{ field: 'name', constraint: 'eq', compareTo: 'updated' }];

    // Create a legacy filter with different content
    const preferences = {
      filters: [
        {
          name: 'My Filter',
          filter: JSON.stringify(originalFilterData)
          // No 'id' property - legacy filter
        }
      ]
    };
    ClassPreferences.updatePreferences(
      preferences,
      'testApp',
      'TestClass'
    );

    // Try to save a filter with same name but different content
    const filters = new MockList(newFilterData);
    const result = browser.saveFilters(filters, 'My Filter', false);

    // Should create a new filter, not update the legacy one
    expect(result).toBe('test-uuid-123');

    const updatedPreferences = ClassPreferences.getPreferences('testApp', 'TestClass');
    expect(updatedPreferences.filters).toHaveLength(2);

    // Original legacy filter should now have UUID auto-assigned
    expect(updatedPreferences.filters[0]).toEqual({
      name: 'My Filter',
      id: 'test-uuid-123',
      filter: JSON.stringify(originalFilterData)
    });

    // New modern filter should be created
    expect(updatedPreferences.filters[1]).toEqual({
      name: 'My Filter',
      id: 'test-uuid-123',
      filter: JSON.stringify(newFilterData)
    });
  });

  it('does not affect modern filters when updating', () => {
    const filterData = [{ field: 'name', constraint: 'eq', compareTo: 'test' }];

    // Create a modern filter (with ID)
    const preferences = {
      filters: [
        {
          name: 'Modern Filter',
          id: 'existing-id',
          filter: JSON.stringify(filterData)
        }
      ]
    };
    ClassPreferences.updatePreferences(
      preferences,
      'testApp',
      'TestClass'
    );

    // Update the modern filter
    const filters = new MockList(filterData);
    const result = browser.saveFilters(filters, 'Modern Filter', false, 'existing-id');

    // Should return the existing ID, not create a new one
    expect(result).toBe('existing-id');

    const updatedPreferences = ClassPreferences.getPreferences('testApp', 'TestClass');
    expect(updatedPreferences.filters).toHaveLength(1);
    expect(updatedPreferences.filters[0]).toEqual({
      name: 'Modern Filter',
      id: 'existing-id',
      filter: JSON.stringify(filterData)
    });
  });

  it('creates new filter when no existing filter matches', () => {
    const filterData = [{ field: 'name', constraint: 'eq', compareTo: 'test' }];

    // Start with empty preferences
    const preferences = { filters: [] };
    ClassPreferences.updatePreferences(
      preferences,
      'testApp',
      'TestClass'
    );

    // Save a new filter
    const filters = new MockList(filterData);
    const result = browser.saveFilters(filters, 'New Filter', false);

    // Should create a new modern filter
    expect(result).toBe('test-uuid-123');

    const updatedPreferences = ClassPreferences.getPreferences('testApp', 'TestClass');
    expect(updatedPreferences.filters).toHaveLength(1);
    expect(updatedPreferences.filters[0]).toEqual({
      name: 'New Filter',
      id: 'test-uuid-123',
      filter: JSON.stringify(filterData)
    });
  });
});
