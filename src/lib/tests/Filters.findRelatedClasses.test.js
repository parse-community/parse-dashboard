/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const { findRelatedClasses } = require('../Filters');

describe('findRelatedClasses', () => {
  it('does not throw and returns an empty object when allClasses is undefined', () => {
    expect(() => findRelatedClasses('_Installation', undefined)).not.toThrow();
    expect(findRelatedClasses('_Installation', undefined, [], undefined)).toEqual({});
  });

  it('returns the available filters for the referenced class', () => {
    const allClasses = { _Installation: { deviceType: { type: 'String' } } };
    const result = findRelatedClasses('_Installation', allClasses, [], undefined);
    expect(result._Installation).toBeDefined();
    expect(result._Installation.deviceType).toContain('exists');
  });
});
