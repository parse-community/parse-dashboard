/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../ConfigTableData');

const { Map } = require('immutable');
const Parse = require('parse');
const buildConfigTableData = require('../ConfigTableData').default;

describe('buildConfigTableData', () => {
  it('keeps null param values without throwing', () => {
    const params = Map({ nullParam: null, other: 'ok' });
    const masterKeyOnly = Map();

    expect(() => buildConfigTableData(params, masterKeyOnly)).not.toThrow();
    expect(buildConfigTableData(params, masterKeyOnly)).toEqual([
      { param: 'nullParam', value: null, masterKeyOnly: false },
      { param: 'other', value: 'ok', masterKeyOnly: false },
    ]);
  });

  it('converts serialized File and GeoPoint values', () => {
    const params = Map({
      avatar: {
        __type: 'File',
        name: 'photo.png',
        url: 'https://example.com/photo.png',
      },
      location: {
        __type: 'GeoPoint',
        latitude: 40.0,
        longitude: -30.0,
      },
    });
    const masterKeyOnly = Map({ avatar: true });

    const data = buildConfigTableData(params, masterKeyOnly);

    expect(data).toHaveLength(2);
    expect(data[0].param).toBe('avatar');
    expect(data[0].masterKeyOnly).toBe(true);
    expect(data[0].value).toBeInstanceOf(Parse.File);
    expect(data[0].value.name()).toBe('photo.png');
    expect(data[1].param).toBe('location');
    expect(data[1].masterKeyOnly).toBe(false);
    expect(data[1].value).toBeInstanceOf(Parse.GeoPoint);
    expect(data[1].value.latitude).toBe(40.0);
    expect(data[1].value.longitude).toBe(-30.0);
  });
});
