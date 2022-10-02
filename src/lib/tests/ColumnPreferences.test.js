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
import { getPreferences, updatePreferences, getOrder } from '../ColumnPreferences';

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
    expect(getPreferences('testapp', 'Klass')).toBe(null);
  });

  it('handles corrupted entries', () => {
    localStorage.setItem('ParseDashboard:V1:testapp:Klass', '{"cutshort');
    expect(getPreferences('testapp', 'Klass')).toBe(null);
  });

  it('stores and retrieves preferences', () => {
    updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(getPreferences('testapp', 'Klass')).toEqual([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }]);
  });

  it('separates preferences for different classes', () => {
    updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    updatePreferences([{ name: 'objectId', width: 150 }, { name: 'updatedAt', width: 120 }], 'testapp', '_User');
    expect(getPreferences('testapp', 'Klass')).toEqual([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }]);
    expect(getPreferences('testapp', '_User')).toEqual([{ name: 'objectId', width: 150 }, { name: 'updatedAt', width: 120 }]);
  });

  it('can retrive column orderings', () => {
    updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(getOrder({ objectId: {}, createdAt: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }]
    );
  });

  it('tacks unknown columns onto the end', () => {
    updatePreferences([{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }], 'testapp', 'Klass');
    expect(getOrder({ objectId: {}, updatedAt: {}, createdAt: {}, someField: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
    expect(getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
  });

  it('removes columns that no longer exist', () => {
    updatePreferences(
      [{ name: 'objectId', width: 100 }, { name: 'createdAt', width: 150 }, { name: 'updatedAt', width: 150 }, { name: 'someField', width: 150 }],
      'testapp',
      'Klass'
    );
    expect(getOrder({ objectId: {}, createdAt: {}, updatedAt: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }]
    );
    expect(getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'createdAt', width: 150, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }]
    );

    expect(getOrder({ objectId: {}, updatedAt: {}, someField: {} }, 'testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
    expect(getPreferences('testapp', 'Klass')).toEqual(
      [{ cached: true, required: false, name: 'objectId', width: 100, visible: true }, { cached: true, required: false, name: 'updatedAt', width: 150, visible: true }, { cached: true, required: false, name: 'someField', width: 150, visible: true }]
    );
  });
});
