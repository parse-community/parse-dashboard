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
jest.dontMock('../ColumnPreferences');
const ColumnPreferences = require('../ColumnPreferences');

let mockStorage = {};
window.localStorage = {
  setItem(key, value) {
    mockStorage[key] = value;
  },
  getItem(key) {
    return mockStorage[key] || null;
  }
};

describe('ColumnPreferences', () => {
  it('caches fetches', () => {
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toBe(null);
  });

  it('handles corrupted entries', () => {
    localStorage.setItem('ParseDashboard:V1:testapp:Klass', '{"cutshort');
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toBe(null);
  });

  it('stores and retrieves preferences', () => {
    ColumnPreferences.updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toEqual([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }]);
  });

  it('separates preferences for different classes', () => {
    ColumnPreferences.updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    ColumnPreferences.updatePreferences([{ name: 'objectId', width: 150 }, { name: 'updatedAt', width: 120 }], 'testapp', '_User');
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toEqual([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }]);
    expect(ColumnPreferences.getPreferences('testapp', '_User')).toEqual([{ name: 'objectId', width: 150 }, { name: 'updatedAt', width: 120 }]);
  });

  it('can retrive column orderings', () => {
    ColumnPreferences.updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(ColumnPreferences.getOrder({ objectId: {}, createdAt: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }]
    );
  });

  it('tacks unknown columns onto the end', () => {
    ColumnPreferences.updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(ColumnPreferences.getOrder({ objectId: {}, updatedAt: {}, createdAt: {}, someField: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
  });

  it('removes columns that no longer exist', () => {
    ColumnPreferences.updatePreferences(
      [{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }, { name: 'updatedAt', width: 150 }, { name: 'someField', width: 150 }],
      'testapp',
      'Klass'
    );
    expect(ColumnPreferences.getOrder({ objectId: {}, createdAt: {}, updatedAt: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }]
    );
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }]
    );

    expect(ColumnPreferences.getOrder({ objectId: {}, updatedAt: {}, someField: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
    expect(ColumnPreferences.getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
  });
});
